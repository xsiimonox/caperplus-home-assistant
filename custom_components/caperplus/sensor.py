"""Sensors exposed by a CaperPlus Q2."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import CaperPlusCoordinator


@dataclass(frozen=True, kw_only=True)
class Q2SensorDescription:
    key: str
    name: str
    unit: str | None = None
    device_class: SensorDeviceClass | None = None
    entity_category: EntityCategory | None = None
    value: Callable[[dict[str, Any]], float | int | None]


def _hundredths(key: str) -> Callable[[dict[str, Any]], float | None]:
    return lambda data: data[key] / 100 if isinstance(data.get(key), (int, float)) else None


SENSORS = (
    Q2SensorDescription(key="ph", name="pH", unit="pH", value=_hundredths("ph")),
    Q2SensorDescription(
        key="temperature",
        name="Wassertemperatur",
        unit=UnitOfTemperature.CELSIUS,
        device_class=SensorDeviceClass.TEMPERATURE,
        value=_hundredths("temp"),
    ),
    Q2SensorDescription(key="tds", name="TDS", unit="ppm", value=lambda data: data.get("tds")),
    Q2SensorDescription(
        key="rssi",
        name="WLAN-Signal",
        unit=None,
        entity_category=EntityCategory.DIAGNOSTIC,
        value=lambda data: data.get("rssi"),
    ),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up Q2 sensors."""
    coordinator: CaperPlusCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(
        CaperPlusSensor(coordinator, did, description)
        for did in coordinator.devices
        for description in SENSORS
    )


class CaperPlusSensor(CoordinatorEntity[CaperPlusCoordinator], SensorEntity):
    """A single CaperPlus Q2 datapoint."""

    _attr_has_entity_name = True
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(
        self, coordinator: CaperPlusCoordinator, did: str, description: Q2SensorDescription
    ) -> None:
        super().__init__(coordinator)
        self._did = did
        self._description = description
        self._attr_unique_id = f"{did}_{description.key}"
        self._attr_name = description.name
        self._attr_native_unit_of_measurement = description.unit
        self._attr_device_class = description.device_class
        self._attr_entity_category = description.entity_category

    @property
    def device_info(self) -> DeviceInfo:
        device = self.coordinator.devices.get(self._did, {})
        return DeviceInfo(
            identifiers={(DOMAIN, self._did)},
            name=device.get("dev_alias") or device.get("remark") or "CaperPlus Q2",
            manufacturer="CaperPlus",
            model="Q2",
            serial_number=device.get("mac"),
        )

    @property
    def native_value(self) -> float | int | None:
        return self._description.value(self.coordinator.data.get(self._did, {}))
