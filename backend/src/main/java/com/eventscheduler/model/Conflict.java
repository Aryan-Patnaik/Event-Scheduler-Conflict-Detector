package com.eventscheduler.model;

public class Conflict {
    public String event1;
    public String event2;
    public String suggestedStart;
    public String suggestedEnd;

    public Conflict(String event1, String event2, String suggestedStart, String suggestedEnd) {
        this.event1 = event1;
        this.event2 = event2;
        this.suggestedStart = suggestedStart;
        this.suggestedEnd = suggestedEnd;
    }
}
