"""Constants for the CaperPlus Cloud integration."""

from __future__ import annotations

DOMAIN = "caperplus"
PLATFORMS = ["sensor"]

CONF_USERNAME = "username"
CONF_PASSWORD = "password"

# Extracted from the CaperPlus Android app. Gizwits calls it the application ID.
APPLICATION_ID = "c57086e449414a25bd6c505bc566bf33"
API_BASE_URL = "https://api.gizwits.com"
Q2_PRODUCT_KEY = "147bf69ead9248aca0daa12fb8256e0e"

DEFAULT_SCAN_INTERVAL = 60
CALIBRATION_TIMEOUT = 180
