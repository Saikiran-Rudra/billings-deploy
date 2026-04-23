import Customer from "../models/Customer.js";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../utils/AppError.js";
import { CreateCustomerInput, UpdateCustomerInput } from "../validators/customerValidation.js";

/**
 * Customer Service Layer
 * Handles all database operations and business logic for customers
 * This decouples the controller from database implementation
 */
export class CustomerService {
  /**
   * Creates a new customer in the database
   * Handles business logic like determining final shipping address
   *
   * @param userId - The authenticated user ID
   * @param data - Validated customer data
   * @returns The created customer document
   * @throws ConflictError if customer email already exists (11000 error)
   * @throws Error for unexpected database issues
   */
  static async createCustomer(userId: string, data: CreateCustomerInput) {
    try {
      // ── Business logic: Determine final shipping address ──────────
      const finalShipping = data.sameAsBilling
        ? data.billing
        : data.shipping;

      // ── Normalize and prepare data for database ──────────────────
      const customerData = {
        companyId: data.companyId,
        userId,
        customerType: data.customerType,
        salutation: data.salutation || "",
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName || "",
        displayName: data.displayName,
        email: data.email,
        companyNumber: data.companyNumber || "",
        primaryPhone: data.primaryPhone,
        alternatePhone: data.alternatePhone || "",
        gstTreatment: data.gstTreatment || "",
        gstNumber: data.gstNumber || "",
        gstName: data.gstName || "",
        tradeName: data.tradeName || "",
        reverseCharge: (typeof data.reverseCharge === "string" 
          ? data.reverseCharge 
          : (data.reverseCharge ? "yes" : "no")) || "",
        reverseChargeReason: data.reverseChargeReason || "",
        countryOfResidence: data.countryOfResidence || "",
        billing: data.billing || {},
        sameAsBilling: Boolean(data.sameAsBilling),
        shipping: finalShipping || {},
        placeOfSupply: data.placeOfSupply || "",
        panNumber: data.panNumber || "",
        taxPreference: data.taxPreference || "",
        taxExemptionReason: data.taxExemptionReason || "",
        defaultTaxRate: data.defaultTaxRate
          ? String(data.defaultTaxRate)
          : "",
        openingBalance: data.openingBalance
          ? Number(data.openingBalance)
          : 0,
        creditLimit: data.creditLimit ? Number(data.creditLimit) : 0,
        paymentTerms: data.paymentTerms || "",
        preferredPaymentMethod: data.preferredPaymentMethod || "",
        notes: data.notes || "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        customerStatus: data.customerStatus || "active",
      };

      // ── Create and return customer ──────────────────────────────
      const customer = await Customer.create(customerData);
      return customer;
    } catch (error) {
      // ── Handle specific database errors ─────────────────────────
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code: number }).code === 11000
      ) {
        throw new ConflictError(
          "A customer with this email already exists.",
        );
      }

      // ── Re-throw unexpected errors to be handled by controller ──
      throw error;
    }
  }

  /**
   * Retrieves all customers for a given company
   * Sorted by creation date (newest first)
   * Filtered by companyId for multi-tenant isolation
   * Populates related company and user information
   *
   * @param userId - The authenticated user ID
   * @param companyId - The company ID for data isolation
   * @returns Array of customer documents with populated relationships
   */
  static async getCustomers(userId: string, companyId: string) {
    const customers = await Customer.find({ companyId })
      .populate("companyId", "name email")
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });

    return customers;
  }

  /**
   * Retrieves a single customer by ID
   * Ensures customer belongs to the authenticated company
   *
   * @param userId - The authenticated user ID
   * @param id - The customer ID
   * @param companyId - The company ID for data isolation
   * @returns The customer document with populated relationships
   * @throws NotFoundError if customer not found or doesn't belong to company
   */
  static async getCustomerById(userId: string, id: string, companyId: string) {
    const customer = await Customer.findOne({ _id: id, companyId })
      .populate("companyId", "name email")
      .populate("userId", "firstName lastName email");

    if (!customer) {
      throw new NotFoundError("The customer record was not found.");
    }

    return customer;
  }

  /**
   * Updates an existing customer record
   * Handles business logic like updating shipping address when sameAsBilling changes
   *
   * @param userId - The authenticated user ID
   * @param id - The customer ID
   * @param data - Validated update data (partial)
   * @param companyId - The company ID for data isolation
   * @returns The updated customer document
   * @throws NotFoundError if customer not found
   * @throws ConflictError if email already exists (11000 error)
   * @throws Error for unexpected database issues
   */
  static async updateCustomer(
    userId: string,
    id: string,
    data: UpdateCustomerInput,
    companyId: string,
  ) {
    try {
      // ── Business logic: Update shipping if billing changes ───────
      const updatePayload: Record<string, unknown> = { ...data };
      if (
        data.sameAsBilling &&
        (data.billing || data.sameAsBilling)
      ) {
        updatePayload.shipping = data.billing;
      }

      // ── Convert numeric fields ──────────────────────────────────
      if (data.openingBalance !== undefined) {
        updatePayload.openingBalance = Number(data.openingBalance);
      }
      if (data.creditLimit !== undefined) {
        updatePayload.creditLimit = Number(data.creditLimit);
      }
      if (data.defaultTaxRate !== undefined) {
        updatePayload.defaultTaxRate = String(data.defaultTaxRate);
      }

      // ── Convert reverseCharge from string/boolean to string ────────
      if (data.reverseCharge !== undefined) {
        updatePayload.reverseCharge = typeof data.reverseCharge === "string" 
          ? data.reverseCharge 
          : (data.reverseCharge ? "yes" : "no");
      }

      // ── Perform update with validators enabled and company filter ─
      // The { _id, companyId } filter ensures users can only update their own company's data
      const customer = await Customer.findOneAndUpdate(
        { _id: id, companyId },
        { $set: updatePayload },
        { new: true, runValidators: true },
      )
        .populate("companyId", "name email")
        .populate("userId", "firstName lastName email");

      if (!customer) {
        throw new NotFoundError("The customer record was not found or does not belong to your company.");
      }

      return customer;
    } catch (error) {
      // ── Handle specific database errors ─────────────────────────
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code: number }).code === 11000
      ) {
        throw new ConflictError(
          "A customer with this email already exists.",
        );
      }

      // ── Re-throw all other errors (including NotFoundError) ────
      throw error;
    }
  }

  /**
   * Deletes a customer record
   * Ensures customer belongs to the authenticated company
   *
   * @param userId - The authenticated user ID
   * @param id - The customer ID
   * @param companyId - The company ID for data isolation
   * @returns The deleted customer document (before deletion)
   * @throws NotFoundError if customer not found
   */
  static async deleteCustomer(userId: string, id: string, companyId: string) {
    const customer = await Customer.findOneAndDelete({ _id: id, companyId });

    if (!customer) {
      throw new NotFoundError("The customer record was not found.");
    }

    return customer;
  }

  /**
   * Checks if a customer email already exists
   * Useful for pre-validation before operations
   *
   * @param userId - The authenticated user ID
   * @param email - Email to check
   * @param excludeId - Optional customer ID to exclude (for update operations)
   * @returns Boolean indicating if email exists
   */
  static async emailExists(
    userId: string,
    email: string,
    excludeId?: string,
  ): Promise<boolean> {
    const query: Record<string, unknown> = { userId, email };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const customer = await Customer.findOne(query);
    return !!customer;
  }

  /**
   * Counts total customers for a given user
   * Useful for pagination and analytics
   *
   * @param userId - The authenticated user ID
   * @returns Total count of customers
   */
  static async countCustomers(userId: string): Promise<number> {
    return await Customer.countDocuments({ userId });
  }

  /**
   * Retrieves customers with pagination support
   * Useful for handling large customer lists
   *
   * @param userId - The authenticated user ID
   * @param skip - Number of records to skip
   * @param limit - Maximum number of records to return
   * @returns Paginated customer documents
   */
  static async getCustomersPaginated(
    userId: string,
    skip: number = 0,
    limit: number = 50,
  ) {
    const customers = await Customer.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Customer.countDocuments({ userId });

    return {
      customers,
      pagination: {
        skip,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Search customers by name, email, or phone
   * Useful for customer lookup/search features
   *
   * @param userId - The authenticated user ID
   * @param searchTerm - Search term to match
   * @returns Array of matching customers
   */
  static async searchCustomers(
    userId: string,
    searchTerm: string,
  ) {
    const customers = await Customer.find({
      userId,
      $or: [
        { firstName: { $regex: searchTerm, $options: "i" } },
        { lastName: { $regex: searchTerm, $options: "i" } },
        { displayName: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { primaryPhone: { $regex: searchTerm, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    return customers;
  }
}
