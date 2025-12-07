import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DataTableTextFilter,
  DataTableSelectFilter,
  DataTableFilters,
  DataTableFilterBar,
  DataTableInlineFilter,
  type ColumnFilterConfig,
  type FilterState,
} from "@/components/ui/data-table-filters";

describe("DataTableTextFilter", () => {
  it("should render with placeholder", () => {
    const onChange = vi.fn();
    render(
      <DataTableTextFilter
        id="name"
        value=""
        onChange={onChange}
        placeholder="Buscar por nome..."
      />
    );

    expect(screen.getByPlaceholderText("Buscar por nome...")).toBeInTheDocument();
  });

  it("should show search icon by default", () => {
    const onChange = vi.fn();
    render(
      <DataTableTextFilter id="name" value="" onChange={onChange} />
    );

    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  it("should hide search icon when showIcon is false", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DataTableTextFilter id="name" value="" onChange={onChange} showIcon={false} />
    );

    const input = container.querySelector("input");
    expect(input).not.toHaveClass("pl-8");
  });

  it("should call onChange when typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DataTableTextFilter id="name" value="" onChange={onChange} />
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "test");

    expect(onChange).toHaveBeenCalledWith("name", "t");
    expect(onChange).toHaveBeenCalledWith("name", "e");
    expect(onChange).toHaveBeenCalledWith("name", "s");
    expect(onChange).toHaveBeenCalledWith("name", "t");
  });

  it("should show clear button when value is present", () => {
    const onChange = vi.fn();
    render(
      <DataTableTextFilter id="name" value="test" onChange={onChange} />
    );

    expect(screen.getByRole("button", { name: /limpar/i })).toBeInTheDocument();
  });

  it("should not show clear button when value is empty", () => {
    const onChange = vi.fn();
    render(
      <DataTableTextFilter id="name" value="" onChange={onChange} />
    );

    expect(screen.queryByRole("button", { name: /limpar/i })).not.toBeInTheDocument();
  });

  it("should clear value when clear button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DataTableTextFilter id="name" value="test" onChange={onChange} />
    );

    await user.click(screen.getByRole("button", { name: /limpar/i }));

    expect(onChange).toHaveBeenCalledWith("name", "");
  });
});

describe("DataTableSelectFilter", () => {
  const options = [
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" },
    { label: "Guest", value: "guest" },
  ];

  it("should render with placeholder", () => {
    const onChange = vi.fn();
    render(
      <DataTableSelectFilter
        id="role"
        value=""
        onChange={onChange}
        options={options}
        placeholder="Selecione um papel..."
      />
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should display selected value", () => {
    const onChange = vi.fn();
    render(
      <DataTableSelectFilter
        id="role"
        value="admin"
        onChange={onChange}
        options={options}
      />
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should render combobox with correct aria-label", () => {
    const onChange = vi.fn();
    render(
      <DataTableSelectFilter
        id="role"
        value=""
        onChange={onChange}
        options={options}
        label="Selecionar papel"
      />
    );

    expect(screen.getByRole("combobox")).toHaveAttribute("aria-label", "Selecionar papel");
  });
});

describe("DataTableFilters", () => {
  const filters: ColumnFilterConfig[] = [
    { id: "name", label: "Nome", type: "text", placeholder: "Buscar nome..." },
    {
      id: "role",
      label: "Papel",
      type: "select",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
      ],
    },
  ];

  it("should render all configured filters", () => {
    const onFilterChange = vi.fn();
    render(
      <DataTableFilters
        filters={filters}
        filterState={{}}
        onFilterChange={onFilterChange}
      />
    );

    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("Papel")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Buscar nome...")).toBeInTheDocument();
  });

  it("should show clear all button when filters are active", () => {
    const onFilterChange = vi.fn();
    const onClearAll = vi.fn();
    render(
      <DataTableFilters
        filters={filters}
        filterState={{ name: "test" }}
        onFilterChange={onFilterChange}
        onClearAll={onClearAll}
      />
    );

    expect(screen.getByText("Limpar filtros")).toBeInTheDocument();
  });

  it("should not show clear all button when no filters are active", () => {
    const onFilterChange = vi.fn();
    const onClearAll = vi.fn();
    render(
      <DataTableFilters
        filters={filters}
        filterState={{}}
        onFilterChange={onFilterChange}
        onClearAll={onClearAll}
      />
    );

    expect(screen.queryByText("Limpar filtros")).not.toBeInTheDocument();
  });

  it("should call onClearAll when clear button is clicked", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    const onClearAll = vi.fn();
    render(
      <DataTableFilters
        filters={filters}
        filterState={{ name: "test" }}
        onFilterChange={onFilterChange}
        onClearAll={onClearAll}
      />
    );

    await user.click(screen.getByText("Limpar filtros"));

    expect(onClearAll).toHaveBeenCalled();
  });

  it("should hide clear all button when showClearAll is false", () => {
    const onFilterChange = vi.fn();
    const onClearAll = vi.fn();
    render(
      <DataTableFilters
        filters={filters}
        filterState={{ name: "test" }}
        onFilterChange={onFilterChange}
        onClearAll={onClearAll}
        showClearAll={false}
      />
    );

    expect(screen.queryByText("Limpar filtros")).not.toBeInTheDocument();
  });
});

describe("DataTableFilterBar", () => {
  const filters: ColumnFilterConfig[] = [
    { id: "name", label: "Nome", type: "text" },
  ];

  it("should render filter bar with title", () => {
    const onFilterChange = vi.fn();
    render(
      <DataTableFilterBar
        filters={filters}
        filterState={{}}
        onFilterChange={onFilterChange}
      />
    );

    expect(screen.getByText("Filtros")).toBeInTheDocument();
  });

  it("should render actions when provided", () => {
    const onFilterChange = vi.fn();
    render(
      <DataTableFilterBar
        filters={filters}
        filterState={{}}
        onFilterChange={onFilterChange}
        actions={<button>Export</button>}
      />
    );

    expect(screen.getByText("Export")).toBeInTheDocument();
  });
});

describe("DataTableInlineFilter", () => {
  it("should render text filter", () => {
    const onChange = vi.fn();
    render(
      <DataTableInlineFilter
        type="text"
        id="name"
        value=""
        onChange={onChange}
        placeholder="Filter..."
      />
    );

    expect(screen.getByPlaceholderText("Filter...")).toBeInTheDocument();
  });

  it("should render select filter", () => {
    const onChange = vi.fn();
    render(
      <DataTableInlineFilter
        type="select"
        id="role"
        value=""
        onChange={onChange}
        options={[
          { label: "Admin", value: "admin" },
          { label: "User", value: "user" },
        ]}
      />
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
