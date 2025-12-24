package com.eventscheduler.model;

public class Event {
    public String name;
    public int start; // minutes from 00:00
    public int end;

    public Event(String name, String startTime, String endTime) {
        this.name = name;
        this.start = toMinutes(startTime);
        this.end = toMinutes(endTime);
    }

    public static int toMinutes(String time) {
        String[] parts = time.split(":");
        return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
    }

    public static String toTime(int minutes) {
        int h = minutes / 60;
        int m = minutes % 60;
        return String.format("%02d:%02d", h, m);
    }
}
