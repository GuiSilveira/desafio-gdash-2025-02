"""Tests for WeatherData schema."""

import unittest

from src.schemas import WeatherData


class TestWeatherSchema(unittest.TestCase):
    """Tests for WeatherData Pydantic model."""

    def test_valid_minimal_data(self):
        """Test valid data with required fields only."""
        data = {
            "location": "Caruaru",
            "temperature": 25.5,
            "humidity": 60.0,
            "condition": "Céu Limpo",
            "weather_code": 0,
            "collected_at": "2025-01-01T12:00:00",
        }
        model = WeatherData(**data)
        
        self.assertEqual(model.location, "Caruaru")
        self.assertEqual(model.temperature, 25.5)
        self.assertEqual(model.humidity, 60.0)
        self.assertEqual(model.condition, "Céu Limpo")
        self.assertEqual(model.weather_code, 0)

    def test_valid_complete_data(self):
        """Test valid data with all fields."""
        data = {
            "location": "Caruaru",
            "temperature": 25.5,
            "humidity": 60.0,
            "apparent_temperature": 27.0,
            "condition": "Céu Limpo",
            "weather_code": 0,
            "surface_pressure": 1013.25,
            "visibility": 10000.0,
            "collected_at": "2025-01-01T12:00:00",
            "us_aqi": 50,
            "uv_index": 5.0,
            "pm2_5": 12.5,
            "pm10": 25.0,
            "precipitation_probability": 10.0,
            "temperature_max": 30.0,
            "sunrise": "2025-01-01T06:00:00",
            "sunset": "2025-01-01T18:00:00",
        }
        model = WeatherData(**data)
        
        self.assertEqual(model.us_aqi, 50)
        self.assertEqual(model.uv_index, 5.0)
        self.assertEqual(model.precipitation_probability, 10.0)

    def test_invalid_date_format(self):
        """Test that invalid date format raises ValueError."""
        data = {
            "location": "Caruaru",
            "temperature": 25.5,
            "humidity": 60.0,
            "condition": "Céu Limpo",
            "weather_code": 0,
            "collected_at": "INVALID_DATE",
        }
        with self.assertRaises(ValueError):
            WeatherData(**data)

    def test_optional_fields_are_none(self):
        """Test that optional fields default to None."""
        data = {
            "location": "Caruaru",
            "temperature": 25.5,
            "humidity": 60.0,
            "condition": "Céu Limpo",
            "weather_code": 0,
            "collected_at": "2025-01-01T12:00:00",
        }
        model = WeatherData(**data)
        
        self.assertIsNone(model.us_aqi)
        self.assertIsNone(model.uv_index)
        self.assertIsNone(model.apparent_temperature)
        self.assertIsNone(model.hourly_time)

    def test_hourly_arrays(self):
        """Test hourly data arrays."""
        data = {
            "location": "Caruaru",
            "temperature": 25.5,
            "humidity": 60.0,
            "condition": "Céu Limpo",
            "weather_code": 0,
            "collected_at": "2025-01-01T12:00:00",
            "hourly_time": ["2025-01-01T00:00", "2025-01-01T01:00"],
            "hourly_temperature": [22.0, 21.5],
            "hourly_precipitation_probability": [10, 15],
        }
        model = WeatherData(**data)
        
        self.assertEqual(len(model.hourly_time), 2)
        self.assertEqual(len(model.hourly_temperature), 2)
        self.assertEqual(model.hourly_temperature[0], 22.0)

    def test_daily_arrays(self):
        """Test daily forecast arrays."""
        data = {
            "location": "Caruaru",
            "temperature": 25.5,
            "humidity": 60.0,
            "condition": "Céu Limpo",
            "weather_code": 0,
            "collected_at": "2025-01-01T12:00:00",
            "daily_time": ["2025-01-01", "2025-01-02"],
            "daily_temperature_max": [30.0, 31.0],
            "daily_temperature_min": [20.0, 21.0],
            "daily_weather_code": [0, 1],
        }
        model = WeatherData(**data)
        
        self.assertEqual(len(model.daily_time), 2)
        self.assertEqual(model.daily_temperature_max[0], 30.0)
        self.assertEqual(model.daily_weather_code[1], 1)

    def test_model_dump(self):
        """Test model serialization."""
        data = {
            "location": "Caruaru",
            "temperature": 25.5,
            "humidity": 60.0,
            "condition": "Céu Limpo",
            "weather_code": 0,
            "collected_at": "2025-01-01T12:00:00",
        }
        model = WeatherData(**data)
        dumped = model.model_dump()
        
        self.assertIsInstance(dumped, dict)
        self.assertEqual(dumped["location"], "Caruaru")
        self.assertEqual(dumped["temperature"], 25.5)


if __name__ == "__main__":
    unittest.main()
