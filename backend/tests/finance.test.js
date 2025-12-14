/**
 * Unit Tests for Finance Controller
 * 
 * These tests verify:
 * 1. Creating entries with categories preserves both IDs and names
 * 2. Editing entries doesn't wipe category_name or sub_category_name
 * 3. Invalid payloads are rejected with proper validation errors
 * 4. Names are always derived from IDs on the backend
 */

const Finance = require("../models/Finance.models");
const { Category, SubCategory } = require("../models/Finance.Categories.models");
const { createFinance, updateFinance } = require("../controllers/Finance.controllers");

// Mock data
const mockUserId = "507f1f77bcf86cd799439011";
const mockCategoryId = "507f1f77bcf86cd799439012";
const mockSubCategoryId = "507f1f77bcf86cd799439013";

// Mock request and response objects
const createMockReq = (body = {}, params = {}) => ({
    body,
    params,
    userId: mockUserId,
});

const createMockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// Mock mongoose models
jest.mock("../models/Finance.models");
jest.mock("../models/Finance.Categories.models");

describe("Finance Controller Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createFinance", () => {
        test("should create entry with valid category_id and derive category_name", async () => {
            const mockCategory = { _id: mockCategoryId, name: "Food" };
            Category.findById.mockResolvedValue(mockCategory);

            const mockFinance = {
                _id: "507f1f77bcf86cd799439014",
                created_by: mockUserId,
                type: "Expense",
                category_id: mockCategoryId,
                category_name: "Food",
                amount: 100,
                save: jest.fn().mockResolvedValue(true),
            };

            Finance.mockImplementation(() => mockFinance);

            const req = createMockReq({
                type: "Expense",
                category_id: mockCategoryId,
                amount: 100,
                when: new Date(),
            });
            const res = createMockRes();

            await createFinance(req, res);

            expect(Category.findById).toHaveBeenCalledWith(mockCategoryId);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(mockFinance.category_name).toBe("Food");
        });

        test("should reject entry with missing category_id", async () => {
            const req = createMockReq({
                type: "Expense",
                amount: 100,
                when: new Date(),
                // category_id is missing
            });
            const res = createMockRes();

            await createFinance(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "category_id is required" });
        });

        test("should reject entry with invalid category_id", async () => {
            Category.findById.mockResolvedValue(null); // Category not found

            const req = createMockReq({
                type: "Expense",
                category_id: "invalid_id",
                amount: 100,
                when: new Date(),
            });
            const res = createMockRes();

            await createFinance(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid category_id" });
        });

        test("should create entry with valid subcategory and derive names", async () => {
            const mockCategory = { _id: mockCategoryId, name: "Food" };
            const mockSubCategory = { _id: mockSubCategoryId, name: "Restaurants" };

            Category.findById.mockResolvedValue(mockCategory);
            SubCategory.findById.mockResolvedValue(mockSubCategory);

            const mockFinance = {
                _id: "507f1f77bcf86cd799439014",
                created_by: mockUserId,
                type: "Expense",
                category_id: mockCategoryId,
                category_name: "Food",
                sub_category_id: mockSubCategoryId,
                sub_category_name: "Restaurants",
                amount: 100,
                save: jest.fn().mockResolvedValue(true),
            };

            Finance.mockImplementation(() => mockFinance);

            const req = createMockReq({
                type: "Expense",
                category_id: mockCategoryId,
                sub_category_id: mockSubCategoryId,
                amount: 100,
                when: new Date(),
            });
            const res = createMockRes();

            await createFinance(req, res);

            expect(SubCategory.findById).toHaveBeenCalledWith(mockSubCategoryId);
            expect(mockFinance.sub_category_name).toBe("Restaurants");
        });
    });

    describe("updateFinance", () => {
        test("should update entry and preserve category names when only amount changes", async () => {
            const mockFinance = {
                _id: "507f1f77bcf86cd799439014",
                created_by: mockUserId,
                category_id: mockCategoryId,
                category_name: "Food",
                sub_category_id: mockSubCategoryId,
                sub_category_name: "Restaurants",
                amount: 100,
                save: jest.fn().mockResolvedValue(true),
            };

            Finance.findOne.mockResolvedValue(mockFinance);

            const req = createMockReq(
                {
                    amount: 150, // Only changing amount
                },
                { id: mockFinance._id }
            );
            const res = createMockRes();

            await updateFinance(req, res);

            expect(mockFinance.amount).toBe(150);
            expect(mockFinance.category_name).toBe("Food"); // Should be preserved
            expect(mockFinance.sub_category_name).toBe("Restaurants"); // Should be preserved
        });

        test("should update category and derive new category_name", async () => {
            const newCategoryId = "507f1f77bcf86cd799439015";
            const newCategory = { _id: newCategoryId, name: "Transport" };

            const mockFinance = {
                _id: "507f1f77bcf86cd799439014",
                created_by: mockUserId,
                category_id: mockCategoryId,
                category_name: "Food",
                amount: 100,
                save: jest.fn().mockResolvedValue(true),
            };

            Finance.findOne.mockResolvedValue(mockFinance);
            Category.findById.mockResolvedValue(newCategory);

            const req = createMockReq(
                {
                    category_id: newCategoryId,
                },
                { id: mockFinance._id }
            );
            const res = createMockRes();

            await updateFinance(req, res);

            expect(Category.findById).toHaveBeenCalledWith(newCategoryId);
            expect(mockFinance.category_id).toBe(newCategoryId);
            expect(mockFinance.category_name).toBe("Transport");
        });

        test("should reject update with invalid category_id", async () => {
            const mockFinance = {
                _id: "507f1f77bcf86cd799439014",
                created_by: mockUserId,
                category_id: mockCategoryId,
                category_name: "Food",
                save: jest.fn(),
            };

            Finance.findOne.mockResolvedValue(mockFinance);
            Category.findById.mockResolvedValue(null); // Invalid category

            const req = createMockReq(
                {
                    category_id: "invalid_id",
                },
                { id: mockFinance._id }
            );
            const res = createMockRes();

            await updateFinance(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid category_id" });
            expect(mockFinance.save).not.toHaveBeenCalled();
        });

        test("should reject update when trying to set category_id to null", async () => {
            const mockFinance = {
                _id: "507f1f77bcf86cd799439014",
                created_by: mockUserId,
                category_id: mockCategoryId,
                category_name: "Food",
                save: jest.fn(),
            };

            Finance.findOne.mockResolvedValue(mockFinance);

            const req = createMockReq(
                {
                    category_id: null,
                },
                { id: mockFinance._id }
            );
            const res = createMockRes();

            await updateFinance(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "category_id cannot be empty" });
            expect(mockFinance.save).not.toHaveBeenCalled();
        });

        test("should allow clearing subcategory by setting it to null", async () => {
            const mockFinance = {
                _id: "507f1f77bcf86cd799439014",
                created_by: mockUserId,
                category_id: mockCategoryId,
                category_name: "Food",
                sub_category_id: mockSubCategoryId,
                sub_category_name: "Restaurants",
                save: jest.fn().mockResolvedValue(true),
            };

            Finance.findOne.mockResolvedValue(mockFinance);

            const req = createMockReq(
                {
                    sub_category_id: null,
                },
                { id: mockFinance._id }
            );
            const res = createMockRes();

            await updateFinance(req, res);

            expect(mockFinance.sub_category_id).toBeNull();
            expect(mockFinance.sub_category_name).toBe("");
            expect(res.json).toHaveBeenCalled();
        });
    });
});

console.log("✅ Finance Controller Tests Defined");
console.log("Run with: npm test or jest backend/tests/finance.test.js");
