import axios from "axios";
import { printTable } from "console-table-printer";
import { question } from "readline-sync";
import { words as capitalizeWords } from "capitalize";
require("dotenv").config();

const PAGE_SIZE = 10;
const TARGET_TIME_ZONE = "America/Los_Angeles";

interface foodTruckLocation2 {
  coordinates: number[];
  type: string;
}

interface foodTruck {
  addr_date_create: string;
  addr_date_modified: string;
  applicant: string;
  block: string;
  cnn: string;
  coldtruck: string;
  dayofweekstr: string;
  dayorder: string;
  end24: string;
  endtime: string;
  latitude: string;
  location_2: foodTruckLocation2;
  location: string;
  locationdesc: string;
  locationid: string;
  longitude: string;
  lot: string;
  optionaltext: string;
  permit: string;
  start24: string;
  starttime: string;
  x: string;
  y: string;
}

interface FoodTruckDataGetResponse {
  data?: foodTruck[];
}

interface FormattedFoodTruck {
  ADDRESS: string;
  CLOSE?: string;
  DAY?: string;
  NAME: string;
  OPEN?: string;
}

class FoodTruckFinder {
  getCurrentDatetimeData() {
    // Convert current UTC time to PST
    const currentPSTDate = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: TARGET_TIME_ZONE,
      })
    );

    const currentHour = currentPSTDate.getHours();

    return {
      currentHour: `${currentHour < 10 ? "0" : ""}${currentHour}:00`,
      dayorder: currentPSTDate.getDay(),
    };
  }

  async fetchFoodTrucks(pageNumber: number) {
    const { dayorder, currentHour } = this.getCurrentDatetimeData();

    let res: FoodTruckDataGetResponse = {};
    try {
      res = await axios({
        url: process.env.SOCRATA_BASE_URL,
        method: "GET",
        params: {
          $$app_token: process.env.SOCRATA_API_TOKEN,
          $limit: PAGE_SIZE,
          $offset: PAGE_SIZE * pageNumber,
          $order: "applicant",
          // Turns out 24 hour time with leading zeros compares properly alphanumerically
          $where: `start24<='${currentHour}' and end24>'${currentHour}'`,
          // This should be zero-indexed like the js Date API
          dayorder,
        },
      });

      if (!res.data) {
        throw new Error();
      }
    } catch {
      console.log(`Unable to fetch results from Socrata API`);
      process.exit();
    }

    return res.data;
  }

  async fetchPage(pageNumber: number) {
    const foodTrucks = await this.fetchFoodTrucks(pageNumber);

    return foodTrucks.map(
      ({ applicant, location, start24, end24, dayofweekstr }: foodTruck) => {
        if (process.env.NODE_ENV === "development") {
          return {
            NAME: capitalizeWords(applicant),
            ADDRESS: capitalizeWords(location),
            OPEN: start24,
            CLOSE: end24,
            DAY: dayofweekstr,
          } as FormattedFoodTruck;
        } else {
          return {
            NAME: capitalizeWords(applicant),
            ADDRESS: capitalizeWords(location),
          } as FormattedFoodTruck;
        }
      }
    );
  }

  displayTrucks(foodTrucks: FormattedFoodTruck[], pageNumber: number) {
    printTable(foodTrucks);
    const resultStart = pageNumber * PAGE_SIZE + 1;
    const resultEnd = Math.min(
      (pageNumber + 1) * PAGE_SIZE,
      pageNumber * PAGE_SIZE + foodTrucks.length
    );
    console.log(`Viewing Page ${pageNumber + 1} Results ${resultStart}-${resultEnd}\n`);
  }

  async searchOpenFoodTrucks() {
    if (!process.env.SOCRATA_BASE_URL || !process.env.SOCRATA_API_TOKEN) {
      console.log("Invalid .env, make sure this file is configured per readme");
      process.exit();
    }

    let input = "";
    let pageNumber = 0;

    while (input.toUpperCase() !== "Q") {
      const foodTrucks = await this.fetchPage(pageNumber);

      if (foodTrucks.length === 0) {
        console.log("No more results to display");
        break;
      } else if (foodTrucks.length < PAGE_SIZE) {
        this.displayTrucks(foodTrucks, pageNumber);
        console.log("This is the final page of results");
        break;
      } else {
        this.displayTrucks(foodTrucks, pageNumber);
        pageNumber++;
        console.log("Press (Q) to quit");
        console.log("Press any other key to view next page");
        input = question(">>");
      }
    }
    console.log("Enjoy!");
  }
}

new FoodTruckFinder().searchOpenFoodTrucks();
