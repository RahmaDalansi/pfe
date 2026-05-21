package com.example.scolarite.dto;

import java.util.List;

public class DailyPreferencesDetailDto {
    private String day;
    private String dayLabel;
    private TimeSlotDetailDto morning;
    private TimeSlotDetailDto afternoon;
    private TimeSlotDetailDto evening;

    // Constructeurs
    public DailyPreferencesDetailDto() {}

    // Getters et Setters
    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }

    public String getDayLabel() { return dayLabel; }
    public void setDayLabel(String dayLabel) { this.dayLabel = dayLabel; }

    public TimeSlotDetailDto getMorning() { return morning; }
    public void setMorning(TimeSlotDetailDto morning) { this.morning = morning; }

    public TimeSlotDetailDto getAfternoon() { return afternoon; }
    public void setAfternoon(TimeSlotDetailDto afternoon) { this.afternoon = afternoon; }

    public TimeSlotDetailDto getEvening() { return evening; }
    public void setEvening(TimeSlotDetailDto evening) { this.evening = evening; }
}