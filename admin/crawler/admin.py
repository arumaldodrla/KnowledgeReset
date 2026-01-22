from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import Tenant, Application, CrawlJob, Document, CrawlerSetting
import httpx
import os


@admin.register(Tenant)
class TenantAdmin(ModelAdmin):
    list_display = ['name', 'domain', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'domain']
    readonly_fields = ['id', 'created_at']


@admin.register(Application)
class ApplicationAdmin(ModelAdmin):
    list_display = ['name', 'url_doc_base', 'status', 'last_crawl_at', 'created_at']
    list_filter = ['status', 'created_at', 'tenant']
    search_fields = ['name', 'url_doc_base', 'description']
    readonly_fields = ['id', 'created_at', 'last_crawl_at']
    actions = ['start_crawl_action']
    
    @admin.action(description="Start crawl for selected applications")
    def start_crawl_action(self, request, queryset):
        """Start crawl for selected applications"""
        crawler_url = os.getenv('CRAWLER_URL', '').strip()
        success_count = 0
        
        for app in queryset:
            try:
                # Call the crawler service
                response = httpx.post(
                    f"{crawler_url}/api/crawler/start",
                    json={
                        "tenant_id": str(app.tenant_id),
                        "app_id": str(app.id),
                        "url": app.url_doc_base,
                        "max_depth": 50,
                        "max_pages": 100
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    success_count += 1
                    self.message_user(request, f"Started crawl for {app.name}", level='success')
                else:
                    self.message_user(request, f"Failed to start crawl for {app.name}: {response.text}", level='error')
            except Exception as e:
                self.message_user(request, f"Error starting crawl for {app.name}: {str(e)}", level='error')
        
        if success_count > 0:
            self.message_user(request, f"Successfully started {success_count} crawl(s)", level='success')


@admin.register(CrawlJob)
class CrawlJobAdmin(ModelAdmin):
    list_display = ['id_short', 'app', 'status', 'pages_processed_display', 'started_at', 'finished_at']
    list_filter = ['status', 'started_at', 'app']
    search_fields = ['id', 'app__name']
    readonly_fields = ['id', 'started_at', 'finished_at', 'stats', 'created_at']
    
    @display(description="Job ID", ordering="id")
    def id_short(self, obj):
        return str(obj.id)[:8] + "..."
    
    @display(description="Pages", ordering="stats")
    def pages_processed_display(self, obj):
        return obj.pages_processed


@admin.register(Document)
class DocumentAdmin(ModelAdmin):
    list_display = ['title', 'url', 'app', 'created_at', 'updated_at']
    list_filter = ['app', 'created_at', 'updated_at']
    search_fields = ['title', 'url', 'content']
    readonly_fields = ['id', 'created_at', 'updated_at', 'embedding']
    
    def has_add_permission(self, request):
        # Documents are created by crawler, not manually
        return False


@admin.register(CrawlerSetting)
class CrawlerSettingAdmin(ModelAdmin):
    list_display = ['setting_key', 'setting_value', 'tenant', 'updated_at']
    list_filter = ['tenant', 'setting_key']
    search_fields = ['setting_key', 'setting_value', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
