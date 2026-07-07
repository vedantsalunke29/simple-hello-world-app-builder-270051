# API Specification

This application provides a simple backend persistent store to track, count, and display custom greetings across app sessions.

## Endpoints

### 1. Get Greetings List
Retrieve a list of the 10 most recent greeting events along with the total greeting count.
- **URL**: `/greetings`
- **Method**: `GET`
- **Authentication**: Unauthenticated
- **Response Format**:
  ```json
  {
    "greetings": [
      {
        "id": "uuid-string",
        "name": "Alex",
        "language": "English",
        "emoji": "👋",
        "createdAt": "2026-07-07T12:00:00.000Z"
      }
    ],
    "totalCount": 1
  }
  ```

### 2. Save New Greeting
Record a new greeting event.
- **URL**: `/greetings`
- **Method**: `POST`
- **Authentication**: Unauthenticated
- **Request Body**:
  ```json
  {
    "name": "Alex",
    "language": "English",
    "emoji": "👋"
  }
  ```
- **Response Format**:
  ```json
  {
    "id": "uuid-string",
    "name": "Alex",
    "language": "English",
    "emoji": "👋",
    "createdAt": "2026-07-07T12:00:00.000Z"
  }
  ```

### 3. Clear All Greetings
Soft delete all current greeting records.
- **URL**: `/greetings`
- **Method**: `DELETE`
- **Authentication**: Unauthenticated
- **Response Format**:
  ```json
  {
    "success": true,
    "message": "All greeting records soft-deleted successfully"
  }
  ```
