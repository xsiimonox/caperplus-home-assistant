"""Gizwits Cloud API client used by CaperPlus."""

from __future__ import annotations

from typing import Any

from aiohttp import ClientError

from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import API_BASE_URL, APPLICATION_ID, Q2_PRODUCT_KEY


class CaperPlusApiError(Exception):
    """Raised when the CaperPlus Cloud cannot be reached or rejects a request."""


class CaperPlusAuthError(CaperPlusApiError):
    """Raised when the account credentials or token are invalid."""


class CaperPlusApi:
    """Minimal client for the Gizwits endpoints used by the CaperPlus app."""

    def __init__(self, hass, username: str, password: str) -> None:
        self._session = async_get_clientsession(hass)
        self._username = username
        self._password = password
        self._token: str | None = None

    @property
    def _headers(self) -> dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "X-Gizwits-Application-Id": APPLICATION_ID,
        }
        if self._token:
            headers["X-Gizwits-User-token"] = self._token
        return headers

    async def async_login(self) -> None:
        """Authenticate using the same username/password endpoint as the app."""
        try:
            async with self._session.post(
                f"{API_BASE_URL}/app/login",
                headers=self._headers,
                json={"username": self._username, "password": self._password},
                timeout=30,
            ) as response:
                data = await response.json(content_type=None)
        except TimeoutError as err:
            raise CaperPlusApiError("Anmeldung: Cloud antwortet nicht innerhalb von 30 Sekunden") from err
        except ClientError as err:
            raise CaperPlusApiError(f"Anmeldung: Verbindungsfehler ({type(err).__name__})") from err
        except ValueError as err:
            raise CaperPlusApiError(f"Anmeldung: ungültige JSON-Antwort (HTTP {response.status})") from err

        if response.status in (400, 401, 403):
            raise CaperPlusAuthError("CaperPlus login was rejected")
        if response.status >= 400:
            raise CaperPlusApiError(f"CaperPlus login failed ({response.status})")
        if not isinstance(data, dict) or not data.get("token"):
            raise CaperPlusApiError("Anmeldung: Cloud-Antwort enthält kein Sitzungstoken")
        self._token = data["token"]

    async def _async_get(self, path: str) -> dict[str, Any] | list[Any]:
        """Make an authenticated GET request, refreshing the token once if needed."""
        if not self._token:
            await self.async_login()

        for attempt in range(2):
            try:
                async with self._session.get(
                    f"{API_BASE_URL}{path}", headers=self._headers, timeout=30
                ) as response:
                    data = await response.json(content_type=None)
            except TimeoutError as err:
                raise CaperPlusApiError("Datenabruf: Cloud antwortet nicht innerhalb von 30 Sekunden") from err
            except ClientError as err:
                raise CaperPlusApiError(f"Datenabruf: Verbindungsfehler ({type(err).__name__})") from err
            except ValueError as err:
                raise CaperPlusApiError(f"Datenabruf: ungültige JSON-Antwort (HTTP {response.status})") from err

            if response.status in (401, 403) and attempt == 0:
                self._token = None
                await self.async_login()
                continue
            if response.status in (401, 403):
                raise CaperPlusAuthError("CaperPlus session was rejected")
            if response.status >= 400:
                raise CaperPlusApiError(f"CaperPlus Cloud returned HTTP {response.status}")
            if not isinstance(data, (dict, list)):
                raise CaperPlusApiError("CaperPlus Cloud returned an invalid response")
            return data

        raise CaperPlusAuthError("CaperPlus session could not be refreshed")

    async def async_get_q2_devices(self) -> list[dict[str, Any]]:
        """Return the Q2 devices bound to the configured CaperPlus account."""
        data = await self._async_get("/app/bindings?limit=200&skip=0")
        devices = data.get("devices", data.get("data", data)) if isinstance(data, dict) else data
        if not isinstance(devices, list):
            raise CaperPlusApiError("CaperPlus Cloud returned an invalid device list")
        return [
            device
            for device in devices
            if isinstance(device, dict) and device.get("product_key") == Q2_PRODUCT_KEY
        ]

    async def async_get_latest(self, did: str) -> dict[str, Any]:
        """Return the newest published datapoints for a Q2 device."""
        data = await self._async_get(f"/app/devdata/{did}/latest")
        if not isinstance(data, dict):
            raise CaperPlusApiError("CaperPlus Cloud returned invalid device data")
        return data

    async def async_start_ph_calibration(self, did: str, target_ph: float) -> None:
        """Start pH calibration using the flow observed in the official app."""
        if not 1.0 <= target_ph <= 14.0:
            raise CaperPlusApiError("Calibration target must be from pH 1 to 14")
        await self._async_post(f"/app/control/{did}", {
            "cal_start": 1,
            "cal_end": 0,
            "cal_val": round(target_ph * 100),
        })

    async def _async_post(self, path: str, payload: dict[str, Any], *, retry: bool = True) -> dict[str, Any] | list[Any]:
        """Send an authenticated control command."""
        if not self._token:
            await self.async_login()
        try:
            async with self._session.post(
                f"{API_BASE_URL}{path}", headers=self._headers, json=payload, timeout=15
            ) as response:
                data = await response.json(content_type=None)
        except (ClientError, TimeoutError, ValueError) as err:
            raise CaperPlusApiError("Could not send calibration command") from err
        if response.status in (401, 403):
            if not retry:
                raise CaperPlusAuthError("CaperPlus control session was rejected")
            self._token = None
            await self.async_login()
            return await self._async_post(path, payload, retry=False)
        if response.status >= 400:
            raise CaperPlusApiError(f"Calibration command failed (HTTP {response.status})")
        if not isinstance(data, (dict, list)):
            raise CaperPlusApiError("CaperPlus Cloud returned an invalid control response")
        return data
