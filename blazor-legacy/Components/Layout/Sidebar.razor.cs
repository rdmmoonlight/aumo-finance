using Microsoft.AspNetCore.Components;

namespace AumoBlazor.Components.Layout
{
    public partial class Sidebar
    {
        private bool showReportsFlyout = false;

        private void ToggleReportsFlyout()
        {
            showReportsFlyout = !showReportsFlyout;
        }

        private void CloseFlyout()
        {
            showReportsFlyout = false;
        }
    }
}
