const admin = {
  name: "FixCareAdmin",
  email: "admin@fixcare.com",
  password: "$2b$10$vQimV146t3I1GfPHSVmbTOdxLD59I.LTSqGJIUdrSNmB8hnOv/yPO",
  role: "admin",
  status: "active",
};

const bcrypt = require("bcrypt");

let pass = "fixcareAdmin096";

const hash = async () => {
  let result = await bcrypt.hash(pass, 10);
  console.log(result);
};

hash();
