const chai = require('chai');
const { clientSignUpSchema, agentSignUpSchema, loginSchema, otpSchema, uuidSchema, rateTicketSchema, 
    userSearchSchema, editAdminTicketSchema } = require('../utility/validations');
const expect = chai.expect;


describe("Testing Validation Schemas", () =>{

    it("Test should pass if a client object valid credentials", ()=>{
        // input object
        const body = {
            first_name: "Terry",
            last_name: "John",
            email: "example@gmail.com",
            password: "Ronan034@",
        };

        const {error, value} = clientSignUpSchema.validate(body);
        expect(error).to.be.undefined;
        expect(value).to.deep.equal(body)
    })

    it("Test should pass if valid agent object is provided", ()=>{
        // input object
        const body = {
            first_name: "Jake",
            last_name: "Peterson",
            email: "jake.peterson@example.com",
            department: "IT",
            password: "Trex123$$$"
        }

        const {error, value} = agentSignUpSchema.validate(body);
        expect(error).to.be.undefined;
        expect(value).to.deep.equal(body)
    })

    it("Test should pass if a valid login object is provided", ()=>{
        // input object
        const body = {
            email: "chris.rock@example.com",
            password: "Rocky20@23"
        };

        const {error, value} = loginSchema.validate(body);
        expect(error).to.be.undefined;
        expect(value).to.deep.equal(body)
    })


    it("Test should fail if a malicious XSS Script or invalid search input is provided", ()=>{
        // search only accepts alphanumeric strings
        const search_obj = {
            search: `<script>alert('Attack!')</script>`
        }
        const {error} = userSearchSchema.validate(search_obj);
        expect(error).to.not.be.undefined;
    })

    it("Test should fail if an invalid OTP value of wrong length is provided", ()=>{
        // uuid are usually alphanumeric strings with - in between some characters
        const uuid_ = {
            otp: "123",
            id: "8300g21c-d571-4654-9ef3-3776d9802953"
        }
        const {error} = otpSchema.validate(uuid_)
        expect(error).to.not.be.undefined
    })


    it("Test should fail if invalid uuid string is provided", ()=>{
        // uuid are usually alphanumeric strings with - in between some characters
        const uuid_ = {
            id: "12dbdwjh2bdds@#"
        }
        const {error} = uuidSchema.validate(uuid_)
        expect(error).to.not.be.undefined
    })

    it('Test should pass for valid ticket rating', () => {
        const validTicket = {
          ticketId: 'ABCD1234',
          rating: '5',
        };
    
        const {error, value} = rateTicketSchema.validate(validTicket);
        expect(error).to.be.undefined;
      });
    
      it('Test should fail for an invalid ticket rating', () => {
        const invalidTicket = {
          ticketId: 'ABCD1234',
          rating: '15',
        };
    
        const {error, value} = rateTicketSchema.validate(invalidTicket);
        expect(error).to.not.be.undefined;
      });
    
      it('Test should fail if rating is not part of the ticket object', () => {
        const ticketWithoutRating = {
          ticketId: 'ABCD1234',
        };
    
        const {error, value} = rateTicketSchema.validate(ticketWithoutRating);
        expect(error).to.exist;
      });


      it('Test should pass for valid input', () => {
        const testData = {
          ticket_id: 'ABC123',
          email: 'test@example.com',
          priority: 'HIGH',
          status: 'IN_PROGRESS'
        };

        const {error, value} = editAdminTicketSchema.validate(testData)
        expect(error).to.be.undefined

    })

})
