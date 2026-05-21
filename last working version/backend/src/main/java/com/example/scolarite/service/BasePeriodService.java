package com.example.scolarite.service;

import com.example.scolarite.entity.BasePeriod;
import java.time.LocalDateTime;
import java.util.List;

public abstract class BasePeriodService<T extends BasePeriod> {

    protected abstract T save(T period);
    protected abstract T findById(Long id);
    protected abstract List<T> findAll();

    public boolean isPeriodActive(T period) {
        return period != null && period.isActive();
    }

    public boolean isPeriodExpired(T period) {
        return period == null || period.isEnded();
    }

    public boolean isPeriodStarted(T period) {
        return period != null && period.isStarted();
    }

    public long getRemainingHours(T period) {
        if (period == null || period.isEnded()) return 0;
        return java.time.Duration.between(LocalDateTime.now(), period.getEndDate()).toHours();
    }

    public boolean validateDates(T period) {
        if (period.getStartDate() == null || period.getEndDate() == null) {
            return false;
        }
        return period.getEndDate().isAfter(period.getStartDate());
    }
}