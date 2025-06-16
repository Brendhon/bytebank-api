import { vi } from "vitest";

// Mocking the necessary modules to isolate tests from actual implementations
vi.mock("../models/User");
vi.mock("../models/Transaction");
vi.mock("jsonwebtoken");
vi.mock("bcryptjs");
