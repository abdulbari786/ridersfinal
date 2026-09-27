# RiderFlow Attendance Demo

A browser-based functional prototype for a rider attendance management platform.

## Demo
Open `index.html` in Chrome/Edge.

## Included
- Admin dashboard
- Rider portal
- Rider IDs, names, phone, partner, store, city
- Rider check-in / check-out
- Working hours
- Daily attendance percentage
- Search/filter
- Excel-compatible CSV export
- Local persistence in browser

## Demo accounts
No password is required in this prototype. Select a rider from Rider Portal.

## Important
This is a client demonstration prototype, not a production deployment. For production, replace localStorage with a secure API/backend, add authentication/authorization, server-side validation, audit logs, database backups, HTTPS and proper deployment.


## Refresh update
- Added a manual **Refresh Attendance** button.
- Admin dashboard auto-refreshes every 5 seconds.
- Changes made in another browser tab are detected immediately through browser storage events.
- Today's Present count, Attendance %, and Working Hours are recalculated from today's attendance records on every refresh.


## Attendance reset/history update
- **Reset Today's Attendance** removes only records dated today.
- Yesterday and all earlier attendance records remain stored.
- Added **Attendance History** with a date picker and Yesterday shortcut.
- Each selected historical day recalculates present count, attendance percentage, and working hours.
- In the production system, daily attendance will be persisted in the server database rather than browser localStorage.


Added: Admin > + Create Rider ID. New riders are saved to the existing localStorage database and immediately appear in Rider Portal for check-in/out.
