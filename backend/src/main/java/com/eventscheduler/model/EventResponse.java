package com.eventscheduler.model;

public class EventResponse {
    public String name;
    public String start;
    public String end;

    public EventResponse(String name, String start, String end) {
        this.name = name;
        this.start = start;
        this.end = end;
    }
}
