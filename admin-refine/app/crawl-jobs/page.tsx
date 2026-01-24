"use client";

import { List, useTable, useSelect } from "@refinedev/antd";
import { Table, Tag, Select, Space } from "antd";

export default function CrawlJobsList() {
    const { tableProps, searchFormProps } = useTable({
        resource: "crawlJobs",
        pagination: {
            pageSize: 10,
        },
        filters: {
            initial: [],
        }
    });

    const { selectProps: appSelectProps } = useSelect({
        resource: "applications",
        optionLabel: "name",
        optionValue: "id",
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
            <Space style={{ marginBottom: 16 }}>
                <Select
                    {...appSelectProps}
                    style={{ width: 200 }}
                    placeholder="Filter by Application"
                    allowClear
                    onChange={(value) => {
                        searchFormProps.onFinish?.({
                            appId: value,
                        });
                    }}
                />
            </Space>
            <Table
                {...tableProps}
                rowKey="id"
                pagination={{
                    ...tableProps.pagination,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                }}
            >
                <Table.Column dataIndex="id" title="Job ID" width={220} ellipsis />
                <Table.Column
                    dataIndex={["application", "name"]}
                    title="Application"
                    width={150}
                    ellipsis
                    render={(value) => value || "-"}
                />
                <Table.Column
                    dataIndex="status"
                    title="Status"
                    width={120}
                    render={(status) => (
                        <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
                    )}
                />
                <Table.Column
                    dataIndex="startedAt"
                    title="Started"
                    width={180}
                    render={(value) => (value ? new Date(value).toLocaleString() : "-")}
                />
                <Table.Column
                    dataIndex="pagesProcessed"
                    title="Pages"
                    width={80}
                    render={(value) => value || 0}
                />
                <Table.Column
                    dataIndex="config"
                    title="Requested By"
                    width={150}
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
                    ellipsis
                    render={(stats) => {
                        try {
                            const parsed = typeof stats === "string" ? JSON.parse(stats) : stats;
                            const error = parsed?.error;
                            if (!error) return "-";
                            // Truncate long errors
                            const shortError = error.length > 50 ? error.substring(0, 50) + "..." : error;
                            return <span style={{ color: "red", fontSize: "12px" }} title={error}>{shortError}</span>;
                        } catch {
                            return "-";
                        }
                    }}
                />
            </Table>
        </List>
    );
}
