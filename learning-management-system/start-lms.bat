@echo off
echo Starting Learning Management System...
echo.

echo Installing backend dependencies...
cd backend
call npm install
echo.

echo Installing frontend dependencies...
cd ../frontend
call npm install
echo.

echo Starting MongoDB (make sure MongoDB is installed)...
start "MongoDB" mongod

echo.
echo Starting backend server...
cd ../backend
start "LMS Backend" cmd /k "npm start"

echo.
echo Starting frontend development server...
cd ../frontend
start "LMS Frontend" cmd /k "ng serve"

echo.
echo LMS is starting up...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:4200
echo.
echo Press any key to exit...
pause