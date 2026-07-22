using Microsoft.AspNetCore.Mvc;

namespace AurumFinance.Controllers
{
    public class JournalEntryController : Controller
    {
        // Route: /JournalEntry/Create
        public IActionResult Create()
        {
            ViewData["Title"] = "New Journal Entry";
            return View();
        }
    }
}