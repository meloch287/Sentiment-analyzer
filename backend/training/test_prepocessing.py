import unittest
from preprocessing import preprocess_text, preprocess_batch


class TestPreprocessText(unittest.TestCase):

    def test_lowercase_russian(self):
        self.assertEqual(preprocess_text("ПРИВЕТ МИР"), "привет мир")
    
    def test_lowercase_english(self):
        self.assertEqual(preprocess_text("Hello World"), "hello world")
    
    def test_lowercase_mixed(self):
        self.assertEqual(preprocess_text("Привет WORLD"), "привет world")

    def test_html_simple_tag(self):
        self.assertEqual(preprocess_text("<b>Жирный</b>"), "жирный")
    
    def test_html_nested_tags(self):
        self.assertEqual(preprocess_text("<div><p>Текст</p></div>"), "текст")
    
    def test_html_with_attributes(self):
        self.assertEqual(preprocess_text('<a href="link">Ссылка</a>'), "ссылка")

    def test_url_https(self):
        self.assertEqual(preprocess_text("Сайт https://example.com тут"), "сайт тут")
    
    def test_url_http(self):
        self.assertEqual(preprocess_text("Смотри http://test.ru/page"), "смотри")
    
    def test_url_www(self):
        self.assertEqual(preprocess_text("Зайди на www.shop.ru"), "зайди на")

    def test_emoji_smileys(self):
        self.assertEqual(preprocess_text("Круто 😊😍🔥"), "круто")
    
    def test_emoji_mixed_with_text(self):
        self.assertEqual(preprocess_text("Супер🔥товар👍рекомендую"), "супертоваррекомендую")

    def test_punctuation_repeated_exclamation(self):
        self.assertEqual(preprocess_text("Отлично!!!"), "отлично!")
    
    def test_punctuation_repeated_question(self):
        self.assertEqual(preprocess_text("Почему???"), "почему?")
    
    def test_punctuation_mixed_repeated(self):
        self.assertEqual(preprocess_text("Что!!!???"), "что!?")
    
    def test_punctuation_normal(self):
        self.assertEqual(preprocess_text("Привет, мир!"), "привет, мир!")

    def test_special_chars_removed(self):
        self.assertEqual(preprocess_text("Цена: 100$ или 90€"), "цена 100 или 90")
    
    def test_allowed_chars_preserved(self):
        self.assertEqual(preprocess_text("Тест-драйв, версия 2.0!"), "тест-драйв, версия 2.0!")

    def test_multiple_spaces(self):
        self.assertEqual(preprocess_text("Много    пробелов"), "много пробелов")
    
    def test_leading_trailing_spaces(self):
        self.assertEqual(preprocess_text("   Текст   "), "текст")
    
    def test_tabs_and_newlines(self):
        self.assertEqual(preprocess_text("Строка\tс\nпереносами"), "строка с переносами")

    def test_short_text_two_chars(self):
        self.assertEqual(preprocess_text("ок"), "")
    
    def test_short_text_one_char(self):
        self.assertEqual(preprocess_text("а"), "")
    
    def test_short_text_three_chars(self):
        self.assertEqual(preprocess_text("да!"), "да!")
    
    def test_short_after_cleaning(self):
        self.assertEqual(preprocess_text("!@#"), "")

    def test_empty_string(self):
        self.assertEqual(preprocess_text(""), "")
    
    def test_none_input(self):
        self.assertEqual(preprocess_text(None), "")
    
    def test_only_spaces(self):
        self.assertEqual(preprocess_text("     "), "")
    
    def test_only_emoji(self):
        self.assertEqual(preprocess_text("🔥😊👍"), "")

    def test_real_negative_review(self):
        result = preprocess_text("Курьер опоздал на два часа!!!")
        self.assertEqual(result, "курьер опоздал на два часа!")
    
    def test_real_positive_review(self):
        result = preprocess_text("Всё упаковано отлично 👍")
        self.assertEqual(result, "всё упаковано отлично")
    
    def test_real_neutral_review(self):
        result = preprocess_text("Обычный товар, ничего особенного.")
        self.assertEqual(result, "обычный товар, ничего особенного.")

    def test_cyrillic_preserved(self):
        text = "Абвгдеёжзийклмнопрстуфхцчшщъыьэюя"
        self.assertEqual(preprocess_text(text), text.lower())
    
    def test_yo_letter_preserved(self):
        self.assertEqual(preprocess_text("Ёлка и ёжик"), "ёлка и ёжик")


class TestPreprocessBatch(unittest.TestCase):
    
    def test_batch_basic(self):
        inputs = ["ПРИВЕТ", "Мир!!!"]
        expected = ["привет", "мир!"]
        self.assertEqual(preprocess_batch(inputs), expected)
    
    def test_batch_empty_list(self):
        self.assertEqual(preprocess_batch([]), [])
    
    def test_batch_with_short_texts(self):
        inputs = ["Нормальный текст", "ок", "Ещё текст"]
        expected = ["нормальный текст", "", "ещё текст"]
        self.assertEqual(preprocess_batch(inputs), expected)
    
    def test_batch_real_data(self):
        inputs = [
            "Курьер опоздал на два часа",
            "Всё упаковано отлично!!!",
            "Товар пришел с браком 😡",
        ]
        expected = [
            "курьер опоздал на два часа",
            "всё упаковано отлично!",
            "товар пришел с браком",
        ]
        self.assertEqual(preprocess_batch(inputs), expected)


class TestComplexCases(unittest.TestCase):
    
    def test_all_cleaning_steps(self):
        text = "  <b>СУПЕР</b> товар!!! 🔥 https://shop.ru Рекомендую!!!  "
        expected = "супер товар! рекомендую!"
        self.assertEqual(preprocess_text(text), expected)
    
    def test_html_with_emoji_and_url(self):
        text = "<p>Смотри 😊 тут: https://example.com</p>"
        expected = "смотри тут"
        self.assertEqual(preprocess_text(text), expected)
    
    def test_numbers_preserved(self):
        text = "Доставка за 2 дня, цена 1500"
        expected = "доставка за 2 дня, цена 1500"
        self.assertEqual(preprocess_text(text), expected)


if __name__ == "__main__":
    unittest.main(verbosity=2)
