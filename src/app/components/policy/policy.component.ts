import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/service/http-service/http.service';
import { HttpHeaders } from '@angular/common/http';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { lastValueFrom } from 'rxjs';

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

  constructor(
    private httpService: HttpService,
  ) {
    const authToken = localStorage.getItem('authToken');
    this.headers = authToken
      ? new HttpHeaders().set('Authorization', `Bearer ${authToken}`)
      : new HttpHeaders();
    if (!authToken) {
      console.error('Authorization token is missing');
    }
  }

  async fetchCustomerDetails(): Promise<void> {
    try {
      const response: any = await lastValueFrom(
        this.httpService.getCustomerById('/api/v1/customer/getcustomer', {
          headers: this.headers,
        })
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
    this.httpService.createPolicy('/api/v1/policy', formData, { headers: this.headers }).subscribe({
      next: (res) => {
        alert('Your policy has been submitted successfully!');
      },
      error: (err) => {
        console.error('Error creating policy', err);
      }
    });
  }

  generatePDF(): any {
    // Create a new jsPDF instance
    const pdf = new jsPDF();

    // Extract form values
    const fullName = (document.getElementById('fullName') as HTMLInputElement).value;
    const address = (document.getElementById('address') as HTMLInputElement).value;
    const dob = (document.getElementById('dob') as HTMLInputElement).value;
    const gender = (document.getElementById('gender') as HTMLInputElement).value;
    const income = (document.getElementById('income') as HTMLInputElement).value;
    const education = (document.getElementById('education') as HTMLInputElement).value;
    const nomineeName = (document.getElementById('nomineename') as HTMLInputElement).value;
    const nomineeRelation = (document.getElementById('nomineerel') as HTMLInputElement).value;
    const nomineeAddress = (document.getElementById('nomineeadd') as HTMLInputElement).value;
    const nomineeContact = (document.getElementById('nomineecon') as HTMLInputElement).value;
    const idProof = (document.getElementById('idproof') as HTMLInputElement).value;
    const ageProof = (document.getElementById('ageproof') as HTMLInputElement).value;
    const incomeProof = (document.getElementById('incomeproof') as HTMLInputElement).value;


    // Add content to the PDF
    pdf.text('Policy Application', 80, 20);
    pdf.text('Applicant Details', 10, 35);
    pdf.line(10, 36, 52, 36);
    pdf.text(`Name: ${fullName}`, 10, 50);
    pdf.text(`Address: ${address}`, 10, 60);
    pdf.text(`Date of Birth: ${dob}`, 10, 70);
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
    console.log(this.files[proofType]);
    
  }
}
