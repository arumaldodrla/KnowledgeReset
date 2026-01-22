"use client";

if (typeof window !== "undefined") {
    const originalWarn = console.warn;
    const originalError = console.error;

    const IGNORED_WARNINGS = [
        "[antd: Menu] `children` is deprecated",
        "[antd: Table] `pagination.position` is deprecated",
        "Instance created by `useForm` is not connected to any Form element",
        "A tree hydrated but some attributes of the server rendered HTML didn't match",
        "[antd: compatible] antd v5 support React is 16 ~ 18",
    ];

    console.warn = (...args) => {
        const msg = args.join(" ");
        if (IGNORED_WARNINGS.some((ignored) => msg.includes(ignored))) {
            return;
        }
        originalWarn.apply(console, args);
    };

    console.error = (...args) => {
        const msg = args.join(" ");
        if (IGNORED_WARNINGS.some((ignored) => msg.includes(ignored))) {
            return;
        }
        originalError.apply(console, args);
    };
}
