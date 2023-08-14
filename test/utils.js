const chai = require("chai");

// assertion style "should", "expect" "assert"
const expect = chai.expect;
const assert = chai.assert;
chai.should();

const { getRandomAlphanumericString, generateRandomTicketId, 
    generateOTP, removePunctuations, generateStaffID } = require("../utility/utils");
const {hashPassword, comparePasswords} = require('../utility/helpers')


describe("Testing Utils and Helper Functions", ()=>{

    it("Test should pass if an aplphanumeric string of length 30 is generated", ()=>{
        const get_string = getRandomAlphanumericString(30);

        get_string.should.have.lengthOf(30);
    });

    it("Test should pass if a ticket id of length 30 is generated", ()=>{
        const get_string = generateRandomTicketId();

        get_string.should.have.lengthOf(10);
    });

    it("Test should pass if password if hash password is compared successfully with initial password string", ()=>{

        const password_ = "Regex1234#@"

        const hashedPassword = hashPassword(password_)

        comparePasswords(password_, hashedPassword)
        .then((isValid)=>{
            expect(isValid).to.be.true
        })

    })

    it("Test should pass is a valid random OTP of length 6 is generated", ()=>{
        const otp_ = generateOTP()
        otp_.should.have.lengthOf(6)
    })

    it('Test should pass if punctuations are removed from the text', () => {
        const inputText = "Hello, world! This is a test.";
        const expectedOutput = "hello world this is a test";
        const actualOutput = removePunctuations(inputText);
        
        assert.equal(actualOutput, expectedOutput);
      });



    it('should generate a staff ID with prefix "CBI" and 7 random numeric characters', () => {
        const staffID = generateStaffID();
        
        // Check if the staff ID starts with "CBI"
        expect(staffID).to.match(/^CBI/);
    
        // Check if the length of staff ID is 10 (3 for prefix + 7 for random characters)
        expect(staffID).to.have.lengthOf(10);
    
        // Check if the remaining characters are numeric
        const numericPart = staffID.slice(3); // Extracting the numeric part
        expect(numericPart).to.match(/^\d{7}$/);
      });

    
})