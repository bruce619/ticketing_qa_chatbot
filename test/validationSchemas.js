const chai = require('chai');
const { clientSignUpSchema, agentSignUpSchema, loginSchema, otpSchema, uuidSchema,
     ticketIDSearchSchema, userSearchSchema, forgotPasswordSchema, passwordResetSchema } = require('../utility/validations');
const expect = chai.expect;


describe("Testing Validation Schemas", () =>{

    it("Test should pass if a client provides valid credentials", ()=>{
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


    it("Test should fail if a malicious XSS Script or invalid search input is provided", ()=>{
        // search only accepts alphanumeric strings
        const search_obj = {
            search: `<script>alert('Attack!')</script>`
        }
        const {error} = userSearchSchema.validate(search_obj);
        expect(error).to.not.be.undefined;
    })

})
