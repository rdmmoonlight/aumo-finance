// <copyright file="HomeDto.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.DTOs.Home
{
    using System.Text.Json.Serialization;
/// <summary>
/// Model data Api Indonesia Kurs Response.
/// </summary>

    public class ApiIndonesiaKursResponse
    {
        /// <summary>
        /// Mewakili Success.
        /// </summary>
        [JsonPropertyName("success")]
        public bool Success { get; set; }
/// <summary>
/// Mewakili Data.
/// </summary>

        [JsonPropertyName("data")]
        public KursData? Data { get; set; }
    }
/// <summary>
/// Mewakili Kurs Data.
/// </summary>

    public class KursData
    {
        /// <summary>
        /// Mewakili Base.
        /// </summary>
        [JsonPropertyName("base")]
        public string Base { get; set; } = string.Empty;
/// <summary>
/// Mewakili Target.
/// </summary>

        [JsonPropertyName("target")]
        public string Target { get; set; } = string.Empty;
/// <summary>
/// Mewakili Rate.
/// </summary>

        [JsonPropertyName("rate")]
        public decimal Rate { get; set; }
/// <summary>
/// Mewakili Change.
/// </summary>

        [JsonPropertyName("change")]
        public decimal Change { get; set; }
    }
/// <summary>
/// Model data Market Indicator Dto.
/// </summary>

    public class MarketIndicatorDto
    {
        /// <summary>
        /// Mewakili Symbol.
        /// </summary>
        public string Symbol { get; set; } = string.Empty;
/// <summary>
/// Mewakili Name.
/// </summary>

        public string Name { get; set; } = string.Empty;

        // Mendukung baik input decimal murni maupun string (dikonversi otomatis secara aman)
        private decimal price;

        public object Price
        {
            get => this.price;
            set
            {
                if (value is decimal decValue)
                {
                    this.price = decValue;
                }
                else if (value != null && decimal.TryParse(value.ToString(), out decimal parsedValue))
                {
                    this.price = parsedValue;
                }
                else
                {
                    this.price = 0m;
                }
            }
        }

        private decimal change;

        public object Change
        {
            get => this.change;
            set
            {
                if (value is decimal decValue)
                {
                    this.change = decValue;
                }
                else if (value != null && decimal.TryParse(value.ToString(), out decimal parsedValue))
                {
                    this.change = parsedValue;
                }
                else
                {
                    this.change = 0m;
                }
            }
        }

        // Fleksibel: dapat di-assign manual ATAU mengkalkulasi otomatis dari Change jika tidak di-assign
        private bool? isUp;

        public bool IsUp
        {
            get
            {
                if (this.isUp.HasValue)
                {
                    return this.isUp.Value;
                }

                return this.change >= 0;
            }
            set => this.isUp = value;
        }
    }
/// <summary>
/// Model data Kurs Data Dto.
/// </summary>

    public class KursDataDto
    {
        /// <summary>
        /// Mewakili Base.
        /// </summary>
        public string Base { get; set; } = string.Empty;
/// <summary>
/// Mewakili Target.
/// </summary>

        public string Target { get; set; } = string.Empty;
/// <summary>
/// Mewakili Rate.
/// </summary>

        public decimal Rate { get; set; }
/// <summary>
/// Mewakili Change.
/// </summary>

        public decimal Change { get; set; }
    }
/// <summary>
/// Model data Api Response Dto.
/// </summary>

    public class ApiResponseDto<T>
    {
        /// <summary>
        /// Mewakili Success.
        /// </summary>
        public bool Success { get; set; }
/// <summary>
/// Mewakili Data.
/// </summary>

        public T? Data { get; set; }
/// <summary>
/// Mewakili Error.
/// </summary>

        public string? Error { get; set; }
/// <summary>
/// Mewakili Message.
/// </summary>

        public string? Message { get; set; }
    }
}