"use client";

import { useList } from "@refinedev/core";
import { List, useTable, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Button, message } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import { GraphQLClient, gql } from "graphql-request";
import { supabaseClient } from "@/app/utils/supabase-client";
import { useState } from "react";

const START_CRAWL_MUTATION = gql`
    mutation StartCrawl($appId: String!, $url: String, $maxDepth: Int, $maxPages: Int) {
        startCrawl(appId: $appId, url: $url, maxDepth: $maxDepth, maxPages: $maxPages) {
            jobId
            status
            message
        }
    }
`;

export default function ApplicationList() {
    const { tableProps } = useTable({
        resource: "applications",
    });
    const [loading, setLoading] = useState<string | null>(null);

    const handleStartCrawl = async (record: any) => {
        console.log("Starting crawl for:", record);
        setLoading(record.id);

        try {
            const { data: { session } } = await supabaseClient.auth.getSession();

            if (!session?.access_token) {
                throw new Error("Not authenticated");
            }

            const client = new GraphQLClient(process.env.NEXT_PUBLIC_API_URL!, {
                headers: {
                    authorization: `Bearer ${session.access_token}`,
                },
            });

            const data: any = await client.request(START_CRAWL_MUTATION, {
                appId: record.id,
                url: record.urlDocBase,
                maxDepth: 3,
                maxPages: 100,
            });

            console.log("Crawl success response:", data);
            message.success(data.startCrawl?.message || "Crawl started successfully!");
        } catch (error: any) {
            console.error("Crawl error:", error);
            message.error(error?.message || "Failed to start crawl");
        } finally {
            setLoading(null);
        }
    };

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="name" title="Name" />
                <Table.Column dataIndex="urlDocBase" title="URL" />
                <Table.Column dataIndex="status" title="Status" />
                <Table.Column
                    dataIndex="lastCrawlAt"
                    title="Last Crawled"
                    render={(value) => (value ? new Date(value).toLocaleString() : "Never")}
                />
                <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record: any) => (
                        <Space>
                            <Button
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                onClick={() => handleStartCrawl(record)}
                                loading={loading === record.id}
                                size="small"
                            >
                                Start Crawl
                            </Button>
                            <EditButton hideText size="small" recordItemId={record.id} />
                            <ShowButton hideText size="small" recordItemId={record.id} />
                            <DeleteButton hideText size="small" recordItemId={record.id} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
}
