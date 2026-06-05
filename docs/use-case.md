```mermaid
usecase
  :Reader: as R
  :Librarian: as L
  :Admin: as A

  R --> (Search Catalog)
  R --> (View Book Details)
  R --> (Request Loan)
  L --> (Issue Book)
  L --> (Return Book)
  L --> (Manage Readers)
  A --> (Manage Books)
  A --> (Manage Staff)
  (Generate Reports) .> A
```
