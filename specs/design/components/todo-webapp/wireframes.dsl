screen TodoList "The signed-in user's personal to-do entries"
  navbar "Todo"
  row
    heading "My To-Dos"
    right
    button "Add entry" primary -> AddEntry
  table "Done | Title | Actions"
    row "☐ | Buy groceries | Edit | Delete"
    row "☑ | Finish report | Edit | Delete"
    row "☐ | Call dentist | Edit | Delete"

screen AddEntry "Add a new to-do entry"
  navbar "Todo"
  card "New Entry"
    input "Title"
    row
      right
      button "Cancel" -> TodoList
      button "Save" primary -> TodoList

screen EditEntry "Edit an existing to-do entry"
  navbar "Todo"
  card "Edit Entry"
    input "Title"
    checkbox "Done" active
    row
      right
      button "Cancel" -> TodoList
      button "Save" primary -> TodoList

flow "Manage my to-dos"
  role "User"
  description "A signed-in user adds, edits, completes, and deletes their own to-do entries"
  TodoList
  AddEntry
  EditEntry
