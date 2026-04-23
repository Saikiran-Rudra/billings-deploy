export enum ProductStatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export const PRODUCT_STATUS_OPTIONS = [
  { value: ProductStatusEnum.ACTIVE, label: "Active" },
  { value: ProductStatusEnum.INACTIVE, label: "Inactive" },
];
