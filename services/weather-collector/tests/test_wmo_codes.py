"""Tests for WMO codes module."""

import unittest

from src.wmo_codes import WMO_CODES, get_condition, DEFAULT_CONDITION


class TestWMOCodes(unittest.TestCase):
    """Tests for WMO weather codes."""

    def test_clear_sky(self):
        """Test code 0 = Céu Limpo."""
        self.assertEqual(get_condition(0), "Céu Limpo")
        self.assertEqual(WMO_CODES.get(0), "Céu Limpo")

    def test_thunderstorm(self):
        """Test code 95 = Tempestade."""
        self.assertEqual(get_condition(95), "Tempestade")

    def test_light_rain(self):
        """Test code 61 = Chuva fraca."""
        self.assertEqual(get_condition(61), "Chuva fraca")

    def test_heavy_rain(self):
        """Test code 65 = Chuva forte."""
        self.assertEqual(get_condition(65), "Chuva forte")

    def test_fog(self):
        """Test code 45 = Nevoeiro."""
        self.assertEqual(get_condition(45), "Nevoeiro")

    def test_snow_codes(self):
        """Test snow-related codes (aligned with core-api)."""
        self.assertEqual(get_condition(71), "Neve leve")
        self.assertEqual(get_condition(73), "Neve moderada")
        self.assertEqual(get_condition(75), "Neve forte")

    def test_unknown_code_returns_default(self):
        """Test unknown code returns default condition."""
        self.assertEqual(get_condition(9999), DEFAULT_CONDITION)
        self.assertEqual(get_condition(-1), DEFAULT_CONDITION)
        self.assertEqual(get_condition(100), DEFAULT_CONDITION)

    def test_wmo_codes_dict_fallback(self):
        """Test WMO_CODES.get() with fallback."""
        self.assertEqual(WMO_CODES.get(9999, "Fallback"), "Fallback")
        self.assertIsNone(WMO_CODES.get(9999))

    def test_all_codes_have_portuguese_descriptions(self):
        """Test all codes have Portuguese descriptions (not English)."""
        for code, description in WMO_CODES.items():
            # Simple check: Portuguese typically has accented characters
            # and doesn't have common English words
            self.assertNotIn("Clear", description)
            self.assertNotIn("Rain", description)
            self.assertNotIn("Snow", description)
            self.assertIsInstance(description, str)
            self.assertGreater(len(description), 0)

    def test_default_condition_value(self):
        """Test DEFAULT_CONDITION is 'Desconhecido'."""
        self.assertEqual(DEFAULT_CONDITION, "Desconhecido")


if __name__ == "__main__":
    unittest.main()
