# searchwords README

### Расширение для поиска по тектсту

При запуске отображает строку для поиска.
* если ввести поисковый запрос:
    * разобъет поисковый запрос на слова, разделитель пробел
    * сформирует регулярку для поиска строк без зависимости от порядка слов
    * совершит поиск по тексту документа:
        * если ничего не найдет, то выведет сообщение о том что ничего не найдено
        * если найдет, то:
            * сформирует список найденных строк
            * отобразит список найденных строк в выпадающем списке
            * выпадающий список можно дополнительно фильтровать
            * при перемещении по строкам выпадающего списка - перемещается курсор по соответствующим строкам в документе
* если не вводить поисковый запрос:
    * отобразит список всех строк документа в выпадающем списке
    * выпадающий список можно дополнительно фильтровать
    * при перемещении по строкам выпадающего списка - перемещается курсор по соответствующим строкам в документе


### Разное
Опции для стилей
https://vshaxe.github.io/vscode-extern/vscode/DecorationRenderOptions.html#backgroundColor

111