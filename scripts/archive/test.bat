@echo off
REM CareConnect Test Runner (Windows)
REM This script runs all tests for both backend and frontend

echo 🧪 CareConnect Test Suite
echo =========================

REM Check if we're in the project root
if not exist "Care2system.code-workspace" (
    echo Error: Please run this script from the project root directory
    exit /b 1
)

REM Default settings
set BACKEND_TESTS=true
set FRONTEND_TESTS=true
set COVERAGE=false

REM Parse command line arguments
:parse_args
if "%1"=="" goto start_tests
if "%1"=="--backend-only" (
    set FRONTEND_TESTS=false
    shift
    goto parse_args
)
if "%1"=="--frontend-only" (
    set BACKEND_TESTS=false
    shift
    goto parse_args
)
if "%1"=="--coverage" (
    set COVERAGE=true
    shift
    goto parse_args
)
if "%1"=="--help" (
    echo Usage: %0 [OPTIONS]
    echo Options:
    echo   --backend-only   Run only backend tests
    echo   --frontend-only  Run only frontend tests
    echo   --coverage       Generate coverage reports
    echo   --help          Show this help message
    exit /b 0
)
shift
goto parse_args

:start_tests
echo Running tests with the following configuration:
echo   Backend tests: %BACKEND_TESTS%
echo   Frontend tests: %FRONTEND_TESTS%
echo   Coverage: %COVERAGE%
echo.

set BACKEND_EXIT_CODE=0
set FRONTEND_EXIT_CODE=0

REM Backend tests
if "%BACKEND_TESTS%"=="true" (
    echo 🔧 Running Backend Tests...
    cd backend
    
    REM Install dependencies if needed
    if not exist "node_modules" (
        echo Installing backend dependencies...
        call npm install
    )
    
    REM Run tests
    if "%COVERAGE%"=="true" (
        call npm run test -- --coverage
    ) else (
        call npm test
    )
    
    set BACKEND_EXIT_CODE=%ERRORLEVEL%
    cd ..
    
    if %BACKEND_EXIT_CODE%==0 (
        echo ✅ Backend Tests - PASSED
    ) else (
        echo ❌ Backend Tests - FAILED
    )
    echo.
) else (
    echo ⏭️  Skipping Backend Tests
)

REM Frontend tests
if "%FRONTEND_TESTS%"=="true" (
    echo 🎨 Running Frontend Tests...
    cd frontend
    
    REM Install dependencies if needed
    if not exist "node_modules" (
        echo Installing frontend dependencies...
        call npm install
    )
    
    REM Run tests
    if "%COVERAGE%"=="true" (
        call npm run test -- --coverage
    ) else (
        call npm test
    )
    
    set FRONTEND_EXIT_CODE=%ERRORLEVEL%
    cd ..
    
    if %FRONTEND_EXIT_CODE%==0 (
        echo ✅ Frontend Tests - PASSED
    ) else (
        echo ❌ Frontend Tests - FAILED
    )
    echo.
) else (
    echo ⏭️  Skipping Frontend Tests
)

REM Summary
echo =========================
echo 🧪 Test Summary
echo =========================

if "%BACKEND_TESTS%"=="true" (
    if %BACKEND_EXIT_CODE%==0 (
        echo ✅ Backend Tests - PASSED
    ) else (
        echo ❌ Backend Tests - FAILED
    )
)

if "%FRONTEND_TESTS%"=="true" (
    if %FRONTEND_EXIT_CODE%==0 (
        echo ✅ Frontend Tests - PASSED
    ) else (
        echo ❌ Frontend Tests - FAILED
    )
)

REM Overall result
if %BACKEND_EXIT_CODE%==0 if %FRONTEND_EXIT_CODE%==0 (
    echo.
    echo 🎉 All tests passed!
    exit /b 0
) else (
    echo.
    echo 💥 Some tests failed!
    exit /b 1
)