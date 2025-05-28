"use client";

import React from "react";
import ErrorPage from "./ErrorPage";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  errorMessage?: string;
  errorStack?: string;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "", errorStack: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error capturado:", error, errorInfo);

    this.setState({
      errorMessage: error.message,
      errorStack: errorInfo.componentStack || '',
    });
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: "", errorStack: "" });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          errorCode={500}
          errorMessage={this.state.errorMessage}
          errorStack={this.state.errorStack}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
