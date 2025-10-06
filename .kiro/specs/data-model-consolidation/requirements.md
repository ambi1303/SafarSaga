# Requirements Document

## Introduction

The SafarSaga backend currently has duplicated and conflicting data models across three separate files: `models.py`, `schemas.py`, and `validators.py`. This creates maintenance overhead, potential bugs, and confusion about which models to use. The system needs a single source of truth for data models with integrated validation that accurately reflects the database schema.

## Requirements

### Requirement 1

**User Story:** As a backend developer, I want a single consolidated file for all data models, so that I have one source of truth for API contracts and data validation.

#### Acceptance Criteria

1. WHEN I need to define a data model THEN I SHALL have only one file to reference and modify
2. WHEN I update a model THEN I SHALL not need to update multiple files to maintain consistency
3. WHEN I add validation rules THEN they SHALL be co-located with the data fields they validate

### Requirement 2

**User Story:** As a backend developer, I want all validation logic integrated into Pydantic models, so that validation rules are maintained alongside the data they validate.

#### Acceptance Criteria

1. WHEN I define a model field THEN validation rules SHALL be defined using Pydantic validators and Field constraints
2. WHEN validation fails THEN I SHALL receive clear, consistent error messages
3. WHEN I need custom validation THEN I SHALL use @validator decorators within the model class

### Requirement 3

**User Story:** As a backend developer, I want data models that accurately reflect the database schema, so that I don't need defensive coding patterns in service layers.

#### Acceptance Criteria

1. WHEN I use a model field THEN it SHALL correspond exactly to a database column
2. WHEN I query the database THEN I SHALL not need fallback logic for missing or misnamed columns
3. WHEN I create or update records THEN the model SHALL enforce the same constraints as the database

### Requirement 4

**User Story:** As a backend developer, I want to eliminate redundant validation files, so that the codebase is cleaner and easier to maintain.

#### Acceptance Criteria

1. WHEN I look for validation logic THEN it SHALL be found within the relevant Pydantic model
2. WHEN I need to add new validation THEN I SHALL not create separate validator functions
3. WHEN validation logic is complex THEN it SHALL still be contained within the model using appropriate Pydantic patterns

### Requirement 5

**User Story:** As a backend developer, I want consistent model organization and naming, so that the API is predictable and easy to use.

#### Acceptance Criteria

1. WHEN I define models THEN they SHALL follow consistent naming patterns (Base, Create, Update, Response)
2. WHEN I organize models THEN related models SHALL be grouped logically
3. WHEN I import models THEN I SHALL import from a single, well-organized module