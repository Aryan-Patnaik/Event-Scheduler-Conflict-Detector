package com.eventscheduler.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.eventscheduler.model.*;
import com.eventscheduler.service.EventService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow frontend access
public class EventController {

    private final EventService service;

    public EventController(EventService service) {
        this.service = service;
    }

    @PostMapping("/schedule")
    public ScheduleResponse scheduleEvents(@RequestBody List<EventRequest> events) {
        return service.processEvents(events);
    }
}
