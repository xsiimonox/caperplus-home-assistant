"""Data coordinator for CaperPlus Q2 devices."""

from __future__ import annotations

from datetime import timedelta
import asyncio
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import CaperPlusApi, CaperPlusApiError, CaperPlusAuthError
from .const import CALIBRATION_TIMEOUT, DEFAULT_SCAN_INTERVAL, DOMAIN


def _entity_data(payload: dict[str, Any]) -> dict[str, Any]:
    """Find Gizwits' entity0 payload despite minor response-shape variations."""
    # The documented current endpoint returns values directly in ``attr``.
    if isinstance(payload.get("attr"), dict):
        return payload["attr"]
    if isinstance(payload.get("entity0"), dict):
        return payload["entity0"]
    nested = payload.get("data")
    if isinstance(nested, dict) and isinstance(nested.get("entity0"), dict):
        return nested["entity0"]
    return {}


class CaperPlusCoordinator(DataUpdateCoordinator[dict[str, dict[str, Any]]]):
    """Poll all Q2 devices registered in the CaperPlus Cloud."""

    def __init__(self, hass: HomeAssistant, api: CaperPlusApi) -> None:
        super().__init__(
            hass,
            logger=logging.getLogger(__name__),
            name=DOMAIN,
            update_interval=timedelta(seconds=DEFAULT_SCAN_INTERVAL),
        )
        self.api = api
        self.devices: dict[str, dict[str, Any]] = {}
        self._calibrating: set[str] = set()

    async def async_calibrate_ph(self, did: str, target_ph: float) -> None:
        """Run one Q2 buffer calibration and wait for device confirmation."""
        if did in self._calibrating:
            raise CaperPlusApiError("A calibration is already running for this Q2")
        self._calibrating.add(did)
        try:
            await self._async_calibrate_ph(did, target_ph)
        finally:
            self._calibrating.discard(did)

    async def _async_calibrate_ph(self, did: str, target_ph: float) -> None:
        baseline = await self.api.async_get_latest(did)
        await self.api.async_start_ph_calibration(did, target_ph)
        seen_reset = False
        for _ in range(CALIBRATION_TIMEOUT):
            await asyncio.sleep(1)
            data = await self.api.async_get_latest(did)
            attrs = _entity_data(data)
            self.async_set_updated_data({**(self.data or {}), did: attrs})
            if attrs.get("cal_end") == 0:
                seen_reset = True
            if not seen_reset and data.get("updated_at") == baseline.get("updated_at"):
                continue
            if attrs.get("cal_end") == 1:
                await self.async_request_refresh()
                return
            if isinstance(attrs.get("cal_end"), (int, float)) and attrs["cal_end"] > 1:
                raise CaperPlusApiError("Q2 reported a pH calibration error")
        raise CaperPlusApiError("Q2 pH calibration timed out")

    async def _async_update_data(self) -> dict[str, dict[str, Any]]:
        try:
            devices = await self.api.async_get_q2_devices()
            self.devices = {device["did"]: device for device in devices if device.get("did")}
            return {
                did: _entity_data(await self.api.async_get_latest(did))
                for did in self.devices
            }
        except CaperPlusAuthError as err:
            raise ConfigEntryAuthFailed from err
        except CaperPlusApiError as err:
            raise UpdateFailed(str(err)) from err
