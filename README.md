# Event Scheduler and Conflict Detector

A web-based event scheduling application that helps users manage their calendar by detecting scheduling conflicts and providing smart alternatives based on working hours.

## Features

- **Event Management**: Add events with name, start time, and end time
- **Automatic Sorting**: Events are automatically sorted by start time when scheduled
- **Conflict Detection**: Identifies overlapping events and highlights conflicts
- **Working Hours Configuration**: Set your working hours to receive intelligent scheduling suggestions
- **Alternative Suggestions**: Get recommendations for rescheduling events that fall outside working hours
- **Intuitive UI**: Clean, user-friendly interface for seamless event management

## Tech Stack

### Frontend
- **HTML5**: Structure and layout
- **CSS3**: Styling and responsive design
- **JavaScript**: Client-side interactivity and event handling

### Backend
- **Java**: Core business logic
- **Spring Boot**: Backend framework for RESTful APIs and frontend-backend integration

## Prerequisites

Before running this project, ensure you have the following installed:

- Java Development Kit (JDK) 11 or higher
- Maven 3.6 or higher
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/event-scheduler.git
   cd event-scheduler
   ```

2. **Build the project**
   ```bash
   mvn clean install
   ```

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

4. **Access the application**
   Open your browser and navigate to:
   ```
   http://localhost:8080
   ```
   or open your index.html file

## Usage

1. **Add Events**
   - Enter the event name in the input field
   - Select the start time using the time picker
   - Select the end time using the time picker
   - Click "Add Event" to add it to your schedule

2. **Configure Working Hours**
   - Set your preferred working start time
   - Set your preferred working end time
   - The system will use these hours to suggest alternatives

3. **Schedule and Detect Conflicts**
   - Click the "Schedule" button to process all events
   - Events will be automatically sorted by start time
   - Any conflicting events will be highlighted
   - Alternative suggestions will be shown for events outside working hours

## Project Structure

```
event-scheduler/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── eventscheduler/
│   │   │           ├── controller/
│   │   │           ├── model/
│   │   │           ├── service/
│   │   │           └── EventSchedulerApplication.java
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── css/
│   │       │   ├── js/
│   │       │   └── index.html
│   │       └── application.properties
│   └── test/
├── pom.xml
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events` | Add a new event |
| GET | `/api/events` | Retrieve all events |
| POST | `/api/schedule` | Sort events and detect conflicts |
| POST | `/api/working-hours` | Set working hours |
| GET | `/api/alternatives` | Get alternative suggestions |

## Configuration

You can modify the application settings in `src/main/resources/application.properties`:

```properties
server.port=8080
spring.application.name=event-scheduler
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## Contact

For questions or support, please open an issue on the GitHub repository.

---

**Note**: This project is designed for educational purposes and demonstrates the integration of frontend technologies with a Spring Boot backend.
