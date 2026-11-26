"""Configuration flow for CaperPlus Cloud."""

from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .api import CaperPlusApi, CaperPlusApiError, CaperPlusAuthError
from .const import CONF_PASSWORD, CONF_USERNAME, DOMAIN


class CaperPlusConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a CaperPlus Cloud configuration flow."""

    VERSION = 1

    async def async_step_user(self, user_input=None) -> FlowResult:
        """Authenticate the CaperPlus account."""
        errors = {}
        if user_input is not None:
            api = CaperPlusApi(self.hass, user_input[CONF_USERNAME], user_input[CONF_PASSWORD])
            try:
                await api.async_login()
                devices = await api.async_get_q2_devices()
            except CaperPlusAuthError:
                errors["base"] = "invalid_auth"
            except CaperPlusApiError:
                errors["base"] = "cannot_connect"
            else:
                if not devices:
                    errors["base"] = "no_q2_devices"
                else:
                    await self.async_set_unique_id(user_input[CONF_USERNAME].lower())
                    self._abort_if_unique_id_configured()
                    return self.async_create_entry(title="CaperPlus Cloud", data=user_input)

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_USERNAME): str,
                    vol.Required(CONF_PASSWORD): str,
                }
            ),
            errors=errors,
        )
