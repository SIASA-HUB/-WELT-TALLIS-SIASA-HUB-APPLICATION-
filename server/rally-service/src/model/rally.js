const { v4: uuidv4 } = require("uuid");

class Rally {
  constructor(data) {
    this.rally_id =
      data.rally_id || `rly_${Date.now()}_${uuidv4().substring(0, 8)}`;
    this.name = data.name;
    this.description = data.description || "";
    this.date = data.date;
    this.time = data.time;
    this.end_time = data.end_time || null;
    this.location = data.location;
    this.venue = data.venue || "";
    this.county = data.county;
    this.image = data.image || "";
    this.image_public_id = data.image_public_id || null;
    this.party = data.party;
    this.leader = data.leader;
    this.status = data.status || "upcoming"; // upcoming, ongoing, completed, cancelled
    this.type = data.type || "rally"; // rally, townhall, summit, meeting
    this.attendees_count = data.attendees_count || 0;
    this.likes_count = data.likes_count || 0;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  validate() {
    const errors = [];

    if (!this.name) errors.push("Rally name is required");
    if (!this.date) errors.push("Date is required");
    if (!this.time) errors.push("Time is required");
    if (!this.location) errors.push("Location is required");
    if (!this.county) errors.push("County is required");
    if (!this.party) errors.push("Party is required");
    if (!this.leader) errors.push("Leader is required");

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = Rally;
