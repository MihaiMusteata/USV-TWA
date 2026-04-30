from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProductBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1)
    quantity: int = Field(ge=1)
    category: str = Field(min_length=1)

    @field_validator("name", "category")
    @classmethod
    def strip_and_validate_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Campul nu poate fi gol.")
        return cleaned


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1)
    quantity: int | None = Field(default=None, ge=1)
    category: str | None = Field(default=None, min_length=1)
    bought: bool | None = None

    @field_validator("name", "category")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Campul nu poate fi gol.")
        return cleaned


class Product(ProductBase):
    id: int
    bought: bool
    user_id: int
