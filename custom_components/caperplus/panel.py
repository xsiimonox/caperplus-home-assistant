"""Register the bundled aquarium sidebar panel."""

from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig

URL = "/caperplus-static"
PANEL = "caperplus-aquarium"


async def async_register_panel(hass):
    """Serve the frontend once and add the panel to the sidebar."""
    if not hass.data.get("caperplus_static_registered"):
        await hass.http.async_register_static_paths([
            StaticPathConfig(URL, str(Path(__file__).parent / "www"), False)
        ])
        hass.data["caperplus_static_registered"] = True
    await panel_custom.async_register_panel(
        hass,
        webcomponent_name="caperplus-aquarium",
        frontend_url_path=PANEL,
        sidebar_title="CaperPlus Aquarium",
        sidebar_icon="mdi:fish",
        module_url=f"{URL}/aquarium.js?v=0.2.2",
        require_admin=False,
    )


def async_remove_panel(hass):
    """Remove sidebar entry when the last account is unloaded."""
    frontend.async_remove_panel(hass, PANEL)
