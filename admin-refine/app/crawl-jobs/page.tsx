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
            </Table>
        </List>
    );
}
