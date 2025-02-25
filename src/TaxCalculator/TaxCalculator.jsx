import React, { useState } from "react";
import CalculateTwoToneIcon from "@mui/icons-material/CalculateTwoTone";
import {
  Button,
  TextField,
  Typography,
  Box,
  Grid,
  CircularProgress,
  FormHelperText,
} from "@mui/material";

const taxSlabs = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 0.05 },
  { upTo: 1200000, rate: 0.1 },
  { upTo: 1600000, rate: 0.15 },
  { upTo: 2000000, rate: 0.2 },
  { upTo: 2400000, rate: 0.25 },
  { upTo: Infinity, rate: 0.3 },
];

function calculateTax(grossIncome) {
  const STANDARD_DEDUCTION = 75000;
  let taxableIncome = Math.max(0, grossIncome - STANDARD_DEDUCTION);

  if (grossIncome <= 1200000 || taxableIncome <= 1275000) {
    return {
      breakdown: [{ slab: "No Tax", taxableIncome, rate: 0, tax: 0 }],
      totalTax: 0,
      grossIncome,
      standardDeduction: STANDARD_DEDUCTION,
      taxableIncome,
    };
  }

  if (taxableIncome <= 400000) {
    return {
      breakdown: [{ slab: "No Tax", taxableIncome, rate: 0, tax: 0 }],
      totalTax: 0,
      grossIncome,
      standardDeduction: STANDARD_DEDUCTION,
      taxableIncome,
    };
  }

  let totalTaxWithoutCess = 0;
  let remainingIncome = taxableIncome;
  let previousLimit = 0;
  const breakdown = [];

  for (let slab of taxSlabs) {
    if (remainingIncome <= 0) break;
    const slabWidth = slab.upTo - previousLimit;
    const taxableInThisSlab = Math.min(remainingIncome, slabWidth);
    if (taxableInThisSlab > 0) {
      const taxForSlab = taxableInThisSlab * slab.rate;
      breakdown.push({
        slab: `${previousLimit + 1} - ${
          slab.upTo === Infinity ? "above" : slab.upTo
        }`,
        taxableIncome: taxableInThisSlab,
        rate: slab.rate,
        tax: taxForSlab,
      });
      totalTaxWithoutCess += taxForSlab;
      remainingIncome -= taxableInThisSlab;
    }
    previousLimit = slab.upTo;
  }

  const cess = totalTaxWithoutCess * 0.04;
  const totalTax = totalTaxWithoutCess + cess;

  return {
    breakdown,
    totalTax,
    grossIncome,
    standardDeduction: STANDARD_DEDUCTION,
    taxableIncome,
  };
}

const TaxCalculator = () => {
  const [annualIncome, setAnnualIncome] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [incomeError, setIncomeError] = useState("");

  const handleCalculate = () => {
    setLoading(true);
    setIncomeError("");
    const income = parseFloat(annualIncome);

    if (isNaN(income) || income < 0) {
      setIncomeError("Please enter a valid income amount");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setResult(calculateTax(income));
      setLoading(false);
    }, 500);
  };

  const cardColors = ["#f8bbd0", "#c8e6c9", "#ffe0b2", "#bbdefb"];
  const barColors = ["#f8bbd0", "#c8e6c9", "#ffe0b2", "#bbdefb"];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 4,
        maxWidth: "6xl",
        mx: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          mb: 6,
          textAlign: "center",
        }}
      >
        <CalculateTwoToneIcon sx={{ fontSize: 50 }} />
        <Typography variant="h5" fontWeight="bold">
          Income Tax Calculator 2025
        </Typography>
      </Box>

      <Box sx={{ width: "100%", maxWidth: "md", mb: 6 }}>
        <Typography variant="h6" mb={2} textAlign="center">
          Enter your annual income (INR)
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 4,
          }}
        >
          <TextField
            variant="outlined"
            size="small"
            value={annualIncome}
            placeholder="Enter amount in INR"
            fullWidth
            onChange={(e) => setAnnualIncome(e.target.value)}
            inputProps={{ inputMode: "numeric", pattern: "*" }}
            error={!!incomeError}
          />
          <Button
            size="large"
            variant="contained"
            onClick={handleCalculate}
            fullWidth
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="white" />
            ) : (
              "Calculate"
            )}
          </Button>
        </Box>
        {incomeError && <FormHelperText error>{incomeError}</FormHelperText>}
      </Box>

      {loading && <CircularProgress />}

      {result && !loading && (
        <Box
          sx={{
            width: "100%",
            maxWidth: "4xl",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <Grid container spacing={4}>
            {[
              { label: "Gross Income", key: "grossIncome" },
              { label: "Standard Deduction", key: "standardDeduction" },
              { label: "Taxable Income", key: "taxableIncome" },
              { label: "Total Tax", key: "totalTax" },
            ].map(({ label, key }, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Box
                  sx={{
                    p: 4,
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    textAlign: "center",
                    backgroundColor: cardColors[i % cardColors.length],
                  }}
                >
                  <Typography color="gray">{label}</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ₹
                    {result[key] !== undefined
                      ? result[key].toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "N/A"}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              display: "flex",
              gap: 4,
              width: "100%",
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  bgcolor: "white",
                  p: 4,
                  borderRadius: "md",
                  boxShadow: 1,
                }}
              >
                <Typography variant="h6" fontWeight="bold" mb={4}>
                  Detailed Breakdown
                </Typography>
                <Box sx={{ overflowX: "auto" }}>
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr style={{ backgroundColor: "#f5f5f5" }}>
                        <th className="border p-2">Slab</th>
                        <th className="border p-2">Taxable Income (₹)</th>
                        <th className="border p-2">Rate</th>
                        <th className="border p-2">Tax (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.breakdown.map((item, index) => (
                        <tr key={index}>
                          <td className="border p-2">{item.slab}</td>
                          <td className="border p-2">
                            {item.taxableIncome.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="border p-2">
                            {(item.rate * 100).toFixed(0)}%
                          </td>
                          <td className="border p-2">₹{item.tax.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  bgcolor: "white",
                  p: 4,
                  borderRadius: "md",
                  boxShadow: 1,
                }}
              >
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Bar Chart - Slab Wise Tax
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "flex-end",
                    height: 200,
                    width: "100%",
                    bgcolor: "white",
                  }}
                >
                  {result.breakdown.map((slab, index) => {
                    const maxTax = Math.max(
                      ...result.breakdown.map((s) => s.tax),
                      0
                    );
                    const barHeight = maxTax ? (slab.tax / maxTax) * 100 : 0;
                    const barColor = barColors[index] || "gray";

                    return (
                      <Box
                        key={index}
                        sx={{
                          width: `${90 / result.breakdown.length}%`,
                          position: "relative",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            position: "absolute",
                            top: -20,
                            width: "100%",
                            textAlign: "center",
                            color: "textSecondary",
                            fontSize: "0.75rem",
                          }}
                        >
                          ₹{" "}
                          {slab.tax.toLocaleString("en-IN", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </Typography>
                        <Box
                          sx={{
                            bgcolor: barColor,
                            width: "100%",
                            height: `${barHeight}%`,
                            transition: "all 0.3s ease",
                            borderRadius: "4px 4px 0 0",
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    width: "100%",
                    paddingTop: "5px",
                  }}
                >
                  {result.breakdown.map((slab, index) => (
                    <Typography
                      key={index}
                      variant="caption"
                      color="textSecondary"
                    >
                      {(slab.rate * 100).toFixed(0)}%
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TaxCalculator;
