import { NextRequest, NextResponse } from "next/server";

// Mock data for demonstration purposes
const generateMockData = (month: string, shopId: string) => {
  const [year, monthNum] = month.split("-");
  const daysInMonth = new Date(parseInt(year), parseInt(monthNum), 0).getDate();

  // Generate random dates with snapshots
  const dates = [];
  const numDates = Math.floor(Math.random() * 10) + 5; // 5-15 dates with deliveries

  for (let i = 0; i < numDates; i++) {
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    const formattedDay = String(day).padStart(2, "0");
    const date = `${year}-${monthNum}-${formattedDay}`;

    // Check if this date is already in the array
    if (!dates.some((d) => d.date === date)) {
      dates.push({
        date,
        count: Math.floor(Math.random() * 3) + 1, // 1-3 snapshots
      });
    }
  }

  return dates;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } },
) {
  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get("shopId");
  const month = searchParams.get("month");

  if (!shopId || !month) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 },
    );
  }

  try {
    // In a real app, you would fetch this data from your database
    // For now, we'll generate mock data
    const deliveryDates = generateMockData(month, shopId);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json(deliveryDates);
  } catch (error) {
    console.error("Error fetching delivery dates:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery dates" },
      { status: 500 },
    );
  }
}
