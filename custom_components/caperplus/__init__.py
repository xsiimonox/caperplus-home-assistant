"""CaperPlus Cloud integration."""

from __future__ import annotations
from functools import partial

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, SupportsResponse
from homeassistant.exceptions import HomeAssistantError
import voluptuous as vol
from homeassistant.helpers import config_validation as cv

from .api import CaperPlusApi
from .const import CONF_PASSWORD, CONF_USERNAME, DOMAIN
from .api import CaperPlusApiError
from .coordinator import CaperPlusCoordinator
from .panel import async_register_panel, async_remove_panel

PLATFORMS: list[Platform] = [Platform.SENSOR]


async def _async_calibrate_ph(hass: HomeAssistant, call) -> dict:
    """Start pH calibration for a configured CaperPlus device."""
    device_id = call.data["device_id"]
    target_ph = call.data["target_ph"]
    device_registry = hass_device_registry(hass)
    device = device_registry.devices.get(device_id)
    if device is None:
        raise vol.Invalid("Unknown Home Assistant device")
    identifier = next((item for item in device.identifiers if item[0] == DOMAIN), None)
    if identifier is None:
        raise vol.Invalid("Selected device is not a CaperPlus Q2")
    did = identifier[1]
    for coordinator in hass.data[DOMAIN].values():
        if did in coordinator.devices:
            try:
                await coordinator.async_calibrate_ph(did, target_ph)
            except CaperPlusApiError as err:
                raise HomeAssistantError(str(err)) from err
            return {"status": "confirmed"}
    raise vol.Invalid("CaperPlus device is not loaded")


def hass_device_registry(hass):
    """Get HA's device registry."""
    from homeassistant.helpers import device_registry as dr

    return dr.async_get(hass)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up CaperPlus from a config entry."""
    api = CaperPlusApi(hass, entry.data[CONF_USERNAME], entry.data[CONF_PASSWORD])
    coordinator = CaperPlusCoordinator(hass, api)
    await coordinator.async_config_entry_first_refresh()
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator
    if not hass.services.has_service(DOMAIN, "calibrate_ph"):
        hass.services.async_register(
            DOMAIN,
            "calibrate_ph",
            partial(_async_calibrate_ph, hass),
            supports_response=SupportsResponse.OPTIONAL,
            schema=vol.Schema(
                {
                    vol.Required("device_id"): cv.string,
                    vol.Required("target_ph"): vol.All(vol.Coerce(float), vol.In([4.00, 6.86, 7.00, 9.18, 9.21, 10.00])),
                }
            ),
        )
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    if len(hass.data[DOMAIN]) == 1:
        await async_register_panel(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload CaperPlus entities."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        hass.data[DOMAIN].pop(entry.entry_id)
        if not hass.data[DOMAIN]:
            hass.services.async_remove(DOMAIN, "calibrate_ph")
            async_remove_panel(hass)
    return unloaded
