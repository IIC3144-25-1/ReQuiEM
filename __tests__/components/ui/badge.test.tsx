import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge Component", () => {
  describe("Rendering", () => {
    it("should render badge with text", () => {
      render(<Badge>Test Badge</Badge>);

      const badge = screen.getByText("Test Badge");
      expect(badge).toBeInTheDocument();
    });

    it("should render badge with default variant", () => {
      render(<Badge data-testid="badge">Default</Badge>);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-primary");
    });

    it("should render badge with secondary variant", () => {
      render(
        <Badge variant="secondary" data-testid="badge">
          Secondary
        </Badge>
      );

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-secondary");
    });

    it("should render badge with destructive variant", () => {
      render(
        <Badge variant="destructive" data-testid="badge">
          Destructive
        </Badge>
      );

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-destructive");
    });

    it("should render badge with outline variant", () => {
      render(
        <Badge variant="outline" data-testid="badge">
          Outline
        </Badge>
      );

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("border");
    });
  });

  describe("Custom Props", () => {
    it("should accept custom className", () => {
      render(
        <Badge className="custom-badge" data-testid="badge">
          Custom
        </Badge>
      );

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("custom-badge");
    });

    it("should accept data attributes", () => {
      render(<Badge data-category="status">Status Badge</Badge>);

      const badge = screen.getByText("Status Badge");
      expect(badge).toHaveAttribute("data-category", "status");
    });

    it("should accept id attribute", () => {
      render(<Badge id="unique-badge">ID Badge</Badge>);

      const badge = screen.getByText("ID Badge");
      expect(badge).toHaveAttribute("id", "unique-badge");
    });
  });

  describe("Content", () => {
    it("should render text content", () => {
      render(<Badge>Simple Text</Badge>);

      expect(screen.getByText("Simple Text")).toBeInTheDocument();
    });

    it("should render with numbers", () => {
      render(<Badge>42</Badge>);

      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("should render with mixed content", () => {
      render(
        <Badge>
          <span>Status:</span> Active
        </Badge>
      );

      expect(screen.getByText("Status:")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("should render empty badge", () => {
      render(<Badge data-testid="empty-badge"></Badge>);

      const badge = screen.getByTestId("empty-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toBeEmptyDOMElement();
    });
  });

  describe("Styling", () => {
    it("should have base badge classes", () => {
      render(<Badge data-testid="badge">Base</Badge>);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("inline-flex");
      expect(badge).toHaveClass("items-center");
      expect(badge).toHaveClass("rounded-md");
      expect(badge).toHaveClass("px-2");
      expect(badge).toHaveClass("py-0.5");
      expect(badge).toHaveClass("text-xs");
      expect(badge).toHaveClass("font-medium");
    });

    it("should apply variant-specific classes", () => {
      const { rerender } = render(
        <Badge variant="secondary" data-testid="badge">
          Test
        </Badge>
      );

      let badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-secondary");
      // Secondary variant should have bg-secondary

      rerender(
        <Badge variant="destructive" data-testid="badge">
          Test
        </Badge>
      );
      badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-destructive");
      expect(badge).toHaveClass("text-white");

      rerender(
        <Badge variant="outline" data-testid="badge">
          Test
        </Badge>
      );
      badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("border");
    });
  });

  describe("Accessibility", () => {
    it("should support aria-label", () => {
      render(<Badge aria-label="Status indicator">Active</Badge>);

      const badge = screen.getByLabelText("Status indicator");
      expect(badge).toBeInTheDocument();
    });

    it("should support role attribute", () => {
      render(
        <Badge role="status" data-testid="badge">
          Loading
        </Badge>
      );

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveAttribute("role", "status");
    });

    it("should be readable by screen readers", () => {
      render(<Badge>Important Notice</Badge>);

      const badge = screen.getByText("Important Notice");
      expect(badge).toBeVisible();
    });
  });

  describe("Use Cases", () => {
    it("should work as status indicator", () => {
      render(<Badge variant="destructive">Error</Badge>);

      const badge = screen.getByText("Error");
      expect(badge).toHaveClass("bg-destructive");
    });

    it("should work as count indicator", () => {
      render(<Badge>99+</Badge>);

      expect(screen.getByText("99+")).toBeInTheDocument();
    });

    it("should work as category tag", () => {
      render(<Badge variant="outline">JavaScript</Badge>);

      const badge = screen.getByText("JavaScript");
      expect(badge).toHaveClass("border");
    });

    it("should work in lists", () => {
      render(
        <div>
          <Badge>Tag 1</Badge>
          <Badge>Tag 2</Badge>
          <Badge>Tag 3</Badge>
        </div>
      );

      expect(screen.getByText("Tag 1")).toBeInTheDocument();
      expect(screen.getByText("Tag 2")).toBeInTheDocument();
      expect(screen.getByText("Tag 3")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should accept responsive classes", () => {
      render(
        <Badge
          className="sm:text-sm md:text-base"
          data-testid="responsive-badge"
        >
          Responsive
        </Badge>
      );

      const badge = screen.getByTestId("responsive-badge");
      expect(badge).toHaveClass("sm:text-sm");
      expect(badge).toHaveClass("md:text-base");
    });
  });

  describe("Integration", () => {
    it("should work with other components", () => {
      render(
        <div>
          <h2>
            Title <Badge>New</Badge>
          </h2>
          <p>
            Content with <Badge variant="outline">inline badge</Badge>
          </p>
        </div>
      );

      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.getByText("inline badge")).toBeInTheDocument();
    });

    it("should maintain styling when nested", () => {
      render(
        <div className="dark">
          <Badge data-testid="nested-badge">Dark Mode</Badge>
        </div>
      );

      const badge = screen.getByTestId("nested-badge");
      expect(badge).toHaveClass("bg-primary");
    });
  });
});
