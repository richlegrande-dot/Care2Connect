#!/bin/bash

# CareConnect Test Runner
# This script runs all tests for both backend and frontend

echo "🧪 CareConnect Test Suite"
echo "========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ $2${NC}"
  else
    echo -e "${RED}❌ $2${NC}"
  fi
}

# Check if we're in the project root
if [ ! -f "Care2system.code-workspace" ]; then
  echo -e "${RED}Error: Please run this script from the project root directory${NC}"
  exit 1
fi

# Test flags
BACKEND_TESTS=true
FRONTEND_TESTS=true
COVERAGE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --backend-only)
      FRONTEND_TESTS=false
      shift
      ;;
    --frontend-only)
      BACKEND_TESTS=false
      shift
      ;;
    --coverage)
      COVERAGE=true
      shift
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --backend-only   Run only backend tests"
      echo "  --frontend-only  Run only frontend tests"
      echo "  --coverage       Generate coverage reports"
      echo "  --help          Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

echo "Running tests with the following configuration:"
echo "  Backend tests: $BACKEND_TESTS"
echo "  Frontend tests: $FRONTEND_TESTS"
echo "  Coverage: $COVERAGE"
echo ""

# Backend tests
if [ "$BACKEND_TESTS" = true ]; then
  echo -e "${YELLOW}🔧 Running Backend Tests...${NC}"
  cd backend
  
  # Install dependencies if needed
  if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
  fi
  
  # Run tests
  if [ "$COVERAGE" = true ]; then
    npm run test -- --coverage
  else
    npm test
  fi
  
  BACKEND_EXIT_CODE=$?
  cd ..
  
  print_status $BACKEND_EXIT_CODE "Backend Tests"
  echo ""
else
  echo -e "${YELLOW}⏭️  Skipping Backend Tests${NC}"
  BACKEND_EXIT_CODE=0
fi

# Frontend tests
if [ "$FRONTEND_TESTS" = true ]; then
  echo -e "${YELLOW}🎨 Running Frontend Tests...${NC}"
  cd frontend
  
  # Install dependencies if needed
  if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
  fi
  
  # Run tests
  if [ "$COVERAGE" = true ]; then
    npm run test -- --coverage
  else
    npm test
  fi
  
  FRONTEND_EXIT_CODE=$?
  cd ..
  
  print_status $FRONTEND_EXIT_CODE "Frontend Tests"
  echo ""
else
  echo -e "${YELLOW}⏭️  Skipping Frontend Tests${NC}"
  FRONTEND_EXIT_CODE=0
fi

# Summary
echo "========================="
echo "🧪 Test Summary"
echo "========================="

if [ "$BACKEND_TESTS" = true ]; then
  print_status $BACKEND_EXIT_CODE "Backend Tests"
fi

if [ "$FRONTEND_TESTS" = true ]; then
  print_status $FRONTEND_EXIT_CODE "Frontend Tests"
fi

# Overall result
if [ $BACKEND_EXIT_CODE -eq 0 ] && [ $FRONTEND_EXIT_CODE -eq 0 ]; then
  echo ""
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}💥 Some tests failed!${NC}"
  exit 1
fi