# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - 2025-09-09

### Added
- Browser automation service foundation in `services/browser-service.mjs`
- Basic environment configuration system (`src/config/service-config.mjs`)
- JSDoc documentation for browser service
- API documentation structure in `docs/api/browser-service.md`
- Services architecture documentation in `docs/SERVICES-ARCHITECTURE.md`
- NPM commands: `npm run auth:quick` and `npm run auth:verify`
- Session management foundation
- Authentication verification system
- Error handling foundation
- Test framework infrastructure (241/241 tests passing)

### Known Issues
- ❌ **CRITICAL**: Core app functionality is broken
- ❌ Cannot create or save decks
- ❌ Cannot create or save cards
- ❌ Cards page displays error messages instead of content
- ❌ App is not usable for actual notecard management

### Technical Details
- **Tests:** 241/241 passing (but testing non-functional features)
- **Status:** Non-functional - Infrastructure only
- **Architecture:** Basic service layer foundation exists
- **Environment:** Development environment setup exists but core app broken

### Notes
- This represents the current state after organizing services infrastructure
- Only automation and testing infrastructure is functional
- Core application features need to be fixed before any usable version
- Version reflects honest assessment of actual functionality
