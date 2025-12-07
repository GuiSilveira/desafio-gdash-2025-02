"""Tests for Open-Meteo weather provider."""

import unittest
from unittest.mock import MagicMock, patch

from src.providers import OpenMeteoProvider


class TestOpenMeteoProvider(unittest.TestCase):
    """Tests for OpenMeteoProvider."""

    def _create_weather_response(self):
        """Create mock weather API response."""
        return {
            "current": {
                "temperature_2m": 25.5,
                "relative_humidity_2m": 60,
                "apparent_temperature": 27.0,
                "weather_code": 0,
                "surface_pressure": 1013.25,
                "visibility": 10000,
            },
            "daily": {
                "time": ["2025-01-01", "2025-01-02"],
                "temperature_2m_max": [30.0, 31.0],
                "temperature_2m_min": [20.0, 21.0],
                "weather_code": [0, 1],
                "sunrise": ["2025-01-01T06:00", "2025-01-02T06:01"],
                "sunset": ["2025-01-01T18:00", "2025-01-02T18:01"],
                "daylight_duration": [43200.0, 43300.0],
                "sunshine_duration": [36000.0, 37000.0],
            },
            "hourly": {
                "time": [f"2025-01-01T{h:02d}:00" for h in range(24)],
                "temperature_2m": [22.0 + h * 0.5 for h in range(24)],
                "precipitation_probability": [10 + h for h in range(24)],
            },
        }

    def _create_air_quality_response(self):
        """Create mock air quality API response."""
        return {
            "current": {
                "us_aqi": 50,
                "uv_index": 5.0,
                "pm2_5": 12.5,
                "pm10": 25.0,
                "carbon_monoxide": 200.0,
                "nitrogen_dioxide": 10.0,
                "sulphur_dioxide": 5.0,
                "ozone": 60.0,
            },
            "hourly": {
                "uv_index": [1.0 + h * 0.5 for h in range(24)],
                "us_aqi": [40 + h for h in range(24)],
            },
        }

    @patch("src.providers.open_meteo.requests.get")
    def test_fetch_success(self, mock_get):
        """Test successful data fetch from both APIs."""
        # Setup mock responses
        weather_response = MagicMock()
        weather_response.json.return_value = self._create_weather_response()
        weather_response.raise_for_status = MagicMock()

        air_quality_response = MagicMock()
        air_quality_response.json.return_value = self._create_air_quality_response()
        air_quality_response.raise_for_status = MagicMock()

        mock_get.side_effect = [weather_response, air_quality_response]

        # Fetch data
        provider = OpenMeteoProvider()
        result = provider.fetch()

        # Assertions
        self.assertIsNotNone(result)
        self.assertEqual(result.temperature, 25.5)
        self.assertEqual(result.humidity, 60)
        self.assertEqual(result.condition, "Céu Limpo")
        self.assertEqual(result.us_aqi, 50)
        self.assertEqual(result.uv_index, 5.0)
        
        # Check arrays
        self.assertEqual(len(result.hourly_time), 24)
        self.assertEqual(len(result.hourly_temperature), 24)
        self.assertEqual(len(result.daily_time), 2)

    @patch("src.providers.open_meteo.requests.get")
    def test_fetch_weather_api_failure(self, mock_get):
        """Test handling of weather API failure."""
        mock_get.side_effect = Exception("Connection Refused")

        provider = OpenMeteoProvider()
        result = provider.fetch()

        self.assertIsNone(result)

    @patch("src.providers.open_meteo.requests.get")
    def test_fetch_air_quality_api_failure(self, mock_get):
        """Test handling of air quality API failure."""
        weather_response = MagicMock()
        weather_response.json.return_value = self._create_weather_response()
        weather_response.raise_for_status = MagicMock()

        mock_get.side_effect = [weather_response, Exception("Air Quality API Error")]

        provider = OpenMeteoProvider()
        result = provider.fetch()

        self.assertIsNone(result)

    @patch("src.providers.open_meteo.requests.get")
    def test_wmo_code_mapping(self, mock_get):
        """Test WMO weather code to condition mapping."""
        weather_data = self._create_weather_response()
        weather_data["current"]["weather_code"] = 95  # Tempestade

        weather_response = MagicMock()
        weather_response.json.return_value = weather_data
        weather_response.raise_for_status = MagicMock()

        air_quality_response = MagicMock()
        air_quality_response.json.return_value = self._create_air_quality_response()
        air_quality_response.raise_for_status = MagicMock()

        mock_get.side_effect = [weather_response, air_quality_response]

        provider = OpenMeteoProvider()
        result = provider.fetch()

        self.assertIsNotNone(result)
        self.assertEqual(result.condition, "Tempestade")

    @patch("src.providers.open_meteo.requests.get")
    def test_unknown_wmo_code(self, mock_get):
        """Test unknown WMO code returns 'Desconhecido'."""
        weather_data = self._create_weather_response()
        weather_data["current"]["weather_code"] = 9999  # Unknown code

        weather_response = MagicMock()
        weather_response.json.return_value = weather_data
        weather_response.raise_for_status = MagicMock()

        air_quality_response = MagicMock()
        air_quality_response.json.return_value = self._create_air_quality_response()
        air_quality_response.raise_for_status = MagicMock()

        mock_get.side_effect = [weather_response, air_quality_response]

        provider = OpenMeteoProvider()
        result = provider.fetch()

        self.assertIsNotNone(result)
        self.assertEqual(result.condition, "Desconhecido")

    def test_custom_configuration(self):
        """Test provider with custom configuration."""
        provider = OpenMeteoProvider(
            weather_url="https://custom.api/weather",
            latitude=-10.0,
            longitude=-40.0,
            city="Custom City",
            timeout=30.0,
        )

        self.assertEqual(provider._weather_url, "https://custom.api/weather")
        self.assertEqual(provider._latitude, -10.0)
        self.assertEqual(provider._longitude, -40.0)
        self.assertEqual(provider._city, "Custom City")
        self.assertEqual(provider._timeout, 30.0)


if __name__ == "__main__":
    unittest.main()
