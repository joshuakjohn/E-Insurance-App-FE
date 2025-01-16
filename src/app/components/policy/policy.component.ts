import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/services/http-services/http.service';
import { HttpHeaders } from '@angular/common/http';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { lastValueFrom } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss']
})
export class PolicyComponent {

  @Output() policyApplication = new EventEmitter()

  @Input() data: any

  planId!: string | null;
  schemeId!: string | null;
  headers: HttpHeaders;
  schemeDetails: any;
  customerData: any;
  files: { [key: string]: File | null } = {
    photograph: null,
    idproof: null,
    ageproof: null,
    incomeproof: null
  };
  policyForm!: FormGroup

  constructor(
    private httpService: HttpService,
    public formBuilder: FormBuilder) {
    const authToken = localStorage.getItem('authToken');
    this.headers = authToken
      ? new HttpHeaders().set('Authorization', `Bearer ${authToken}`)
      : new HttpHeaders();
    if (!authToken) {
      console.error('Authorization token is missing');
    }
  }

  ngOnInit(){
    this.policyForm = this.formBuilder.group({
      fullname: ['', [Validators.required]],
      address: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      income: ['', [Validators.required]],
      education: ['', [Validators.required]],
      incomeproof: ['', [Validators.required]],
      ageproof: ['', [Validators.required]],
      idproof: ['', [Validators.required]],
      incomeproofupload: ['', [Validators.required]],
      ageproofupload: ['', [Validators.required]],
      idproofupload: ['', [Validators.required]],
      photoupload: ['', [Validators.required]],
      nomineerel: [''],
      nomineecon: [''],
      nomineename: [''],
      nomineeadd: ['']
    })
  }

  get policyFormControls() { return this.policyForm.controls; }

  async fetchCustomerDetails(): Promise<void> {
    try {
      const response: any = await lastValueFrom(
        this.httpService.getApiCall('/api/v1/customer/getcustomer', this.headers)
      );
  
      if (response.code === 200) {
        this.customerData = response.data;
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  }

  async onSubmitClick(): Promise<void> {
    await this.fetchCustomerDetails();
    this.planId = this.data.planId    
    this.schemeDetails = this.data.schemeDetails
    

    const application = this.generatePDF() 
    const formData = new FormData();
    formData.append('policyName', this.schemeDetails.schemeName);
    formData.append('description', this.schemeDetails.description);
    formData.append('premiumAmount', this.schemeDetails.premium.toString());
    formData.append('coverage', this.schemeDetails.coverage.toString());
    formData.append('duration', this.schemeDetails.maturityPeriod.toString());
    formData.append('planId', this.planId!);
    formData.append('schemeId', this.schemeDetails._id);
    formData.append('customerId', this.customerData._id);
    formData.append('agentId', this.customerData.agentId);
    formData.append('policyApplication', application, 'PolicyApplication.pdf');

    for (const proofType in this.files) {    
      const file = this.files[proofType];
      if (file) {
        formData.append(proofType, file, file.name);
      }
    }
    if(this.policyForm.valid){
      this.httpService.postApiCall('/api/v1/policy', formData, this.headers).subscribe({
        next: (res) => {
          alert('Your policy has been submitted successfully!');
          this.policyApplication.emit('close')
          this.policyForm.reset();
        },
        error: (err) => {
          console.error('Error creating policy', err);
        }
      });
    }
  }

  generatePDF(): any {
    // Create a new jsPDF instance
    const pdf = new jsPDF();

    // Extract form values
    const fullName = this.policyForm.get('fullname')?.value;
    const address = this.policyForm.get('address')?.value;
    const dob = this.policyForm.get('dob')?.value;
    const gender = this.policyForm.get('gender')?.value;
    const income = this.policyForm.get('income')?.value;
    const education = this.policyForm.get('education')?.value;
    const idProof = this.policyForm.get('idproof')?.value;
    const ageProof = this.policyForm.get('ageproof')?.value;
    const incomeProof = this.policyForm.get('incomeproof')?.value;
    const nomineeName = this.policyForm.get('nomineename')?.value;
    const nomineeRelation = this.policyForm.get('nomineerel')?.value;
    const nomineeAddress = this.policyForm.get('nomineeadd')?.value;
    const nomineeContact = this.policyForm.get('nomineecon')?.value;


    // Add content to the PDF
    pdf.text('Policy Application', 80, 20);
    pdf.text('Applicant Details', 10, 35);
    pdf.line(10, 36, 52, 36);
    pdf.text(`Name: ${fullName}`, 10, 50);
    pdf.text(`Address: ${address}`, 10, 60);    
    pdf.text(`Date of Birth: ${dob.toLocaleDateString('en-CA')}`, 10, 70);
    pdf.text(`Gender: ${gender}`, 10, 80);
    pdf.text(`Annual Income: ${income}`, 10, 90);
    pdf.text(`Educational Qualification: ${education}`, 10, 100);    
    pdf.text('Nominee Details', 10, 115);
    pdf.line(10, 116, 52, 116);
    pdf.text(`Nominee Name: ${nomineeName}`, 10, 130);
    pdf.text(`Nominee Relation: ${nomineeRelation}`, 10, 140);
    pdf.text(`Nominee Address: ${nomineeAddress}`, 10, 150);
    pdf.text(`Nominee Contact: ${nomineeContact}`, 10, 160);
    pdf.text('Uploaded Document Details', 10, 175);
    pdf.line(10, 176, 81, 176);
    pdf.text(`Id Proof: ${idProof}`, 10, 190);    
    pdf.text(`Age Proof: ${ageProof}`, 10, 200);
    pdf.text(`Income Proof: ${incomeProof}`, 10, 210);

    // pdf.save('Application.pdf')
    // Save the PDF
    return pdf.output('blob');  }

  // Capture file on input change
  onFileChange(event: any, proofType: string): void {
    const selectedFile = event.target.files[0]; // Single file
    this.files[proofType] = selectedFile || null;    
  }
}
