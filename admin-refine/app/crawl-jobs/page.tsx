"use client";

import { List, useTable } from "@refinedev/antd";
import { Table, Tag } from "antd";

export default function CrawlJobsList() {
    const { tableProps } = useTable({
        resource: "crawlJobs",
    });

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: "blue",
            running: "processing",
            completed: "success",
            failed: "error",
        };
        return colors[status] || "default";
    };

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="id" title="Job ID" ellipsis />
                <Table.Column dataIndex="appId" title="App ID" ellipsis />
                <Table.Column
                    dataIndex="status"
                    title="Status"
                    render={(status) => (
                        <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
                    )}
                />
                <Table.Column
                    dataIndex="startedAt"
                    title="Started"
                    render={(value) => (value ? new Date(value).toLocaleString() : "-")}
                />
                <Table.Column
                    dataIndex="completedAt"
                    title="Completed"
                    render={(value) => (value ? new Date(value).toLocaleString() : "-")}
                />
                <Table.Column
                    dataIndex="stats"
                    title="Pages Processed"
                    render={(stats) => {
                        try {
                            const parsed = typeof stats === "string" ? JSON.parse(stats) : stats;
                            return parsed?.pages_processed || 0;
                        } catch {
                            return 0;
                        }
                    }}
                />
                <Table.Column
                    dataIndex="config"
                    title="Requested By"
                    render={(config) => {
                        try {
                            const parsed = typeof config === "string" ? JSON.parse(config) : config;
                            // If config has a recurring flag or was triggered automatically, show "Re-Crawl"
                            // Otherwise show "Manual"
                            return parsed?.recurring ? "Re-Crawl" : "Manual";
                        } catch {
                            return "Manual";
                        }
                    }}
                />
                <Table.Column
                    dataIndex="stats"
                    title="Error"
                    render={(stats) => {
                        try {
                            const parsed = typeof stats === "string" ? JSON.parse(stats) : stats;
                            const error = parsed?.error;
                            if (!error) return "-";
                            // Truncate long errors
                            const shortError = error.length > 100 ? error.substring(0, 100) + "..." : error;
                            return <span style={{ color: "red", fontSize: "12px" }}>{shortError}</span>;
                        } catch {
                            return "-";
                        }
                    }}
                />
            </Table>
        </List>
    );
}
